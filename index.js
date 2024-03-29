'use strict'
const path = require('path')
const stampit = require('stampit')
const Koa = require('koa')
const favicon = require('koa-favicon')
const router = require('koa-router')()
const bunyan = require('bunyan')
const uuid = require('uuid')
const session = require('koa-session')
const InvalidArgumentError = require(path.resolve(__dirname, 'invalid-arg-error'))

module.exports = stampit()
  .props({
    uriFactoryPlugins: {},
    sessionOpts: {
      key: 'janus:sess',
      signed: false
    },
    redirectLog: { name: 'redirect' },
    errorLog: { name: 'error' },
    uriPathPrefix: '/',
    favicon: path.resolve(__dirname, 'assets/favicon.ico')
  })
  .methods({
    sessionId (ctx) {
      return new Promise(function (resolve, reject) {
        resolve(uuid.v1())
      })
    },

    errorLogger (errorLog) {
      return bunyan.createLogger(errorLog || this.errorLog)
    },

    redirectLogger (redirectLog) {
      return bunyan.createLogger(redirectLog || this.redirectLog)
    },

    redirectLogEvent (ctx, defaultEvent) {
      return defaultEvent
    },

    defaultRedirectLogEvent (ctx, supportedQueryParams) {
      return {
        request: {
          method: ctx.request.method,
          url: ctx.request.url,
          referer: ctx.request.header.referer,
          userAgent: ctx.request.header['user-agent']
        },
        response: {
          location: ctx.response.header.location
        },
        user: {
          sessionId: ctx.session.id
        },
        query: supportedQueryParams
      }
    }
  })
  .init(function (params) {
    const factory = require(path.resolve(__dirname, 'uri-factory/'))(params.uriFactoryPlugins)
    const sessionId = this.sessionId.bind(this)
    const errorLogger = this.errorLogger(params.errorLog)
    const redirectLogger = this.redirectLogger(params.redirectLog)
    const defaultRedirectLogEvent = this.defaultRedirectLogEvent.bind(this)
    const redirectLogEvent = this.redirectLogEvent.bind(this)

    router.get(params.uriPathPrefix, async function redirect (ctx, next) {
      await next()
      const queryParams = factory.normalizeQueryParams(ctx.request.query)
      const supportedOnly = true
      const supportedQueryParams = factory.normalizeQueryParams(queryParams, supportedOnly)
      const [warning, uri] = await factory.uriFor(queryParams)
      ctx.status = 302
      ctx.redirect(uri.href())
      if (warning) {
        redirectLogger.warn(
          { event: redirectLogEvent(ctx, defaultRedirectLogEvent(ctx, supportedQueryParams)) },
          warning
        )
      } else {
        redirectLogger.info(
          { event: redirectLogEvent(ctx, defaultRedirectLogEvent(ctx, supportedQueryParams)) },
          'ok'
        )
      }
    })

    const app = new Koa()
    app
      .use(favicon(this.favicon))
      .use(session(this.sessionOpts, app))
      .use(async function session (ctx, next) {
        if (!ctx.session.id) {
          ctx.session.id = await sessionId(ctx)
        }
        await next()
      })
      .use(router.routes())
      .use(router.allowedMethods())
      .on('error', (err, ctx) => {
        if (err instanceof InvalidArgumentError) {
          err.status = ctx.status = 400
          errorLogger.warn({ event: redirectLogEvent(ctx, defaultRedirectLogEvent(ctx)) }, err.message)
        } else {
          errorLogger.error({ error: err }, err.message)
        }
      })

    return app
  })
