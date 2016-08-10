'use strict';
const path = require('path');
const stampit = require('stampit');
const Koa = require('koa');
const favicon = require('koa-favicon');
const router = require('koa-router')();
const co = require('bluebird').coroutine;
const bunyan = require('bunyan');
const uuid = require('uuid');
const session = require('koa-session');
const convert = require('koa-convert');
const InvalidArgumentError = require(path.resolve(__dirname, 'invalid-arg-error'));

module.exports = stampit()
.props({
  uriFactoryPlugins: {},
  sessionOpts: {
    key: 'janus:sess',
    signed: false
  },
  redirectLog: {name: 'redirect'},
  errorLog: {name: 'error'},
  uriPathPrefix: '/',
  favicon: path.resolve(__dirname, 'assets/favicon.ico'),
})
.methods({
  sessionId (ctx) {
    return new Promise(function (resolve, reject) {
      resolve(uuid.v1());
    });
  }, 

  errorLogger () {
    return bunyan.createLogger(this.errorLog);
  },

  redirectLogger () {
    return bunyan.createLogger(this.redirectLog);
  },

  redirectLogEvent (ctx, defaultEvent) {
    return defaultEvent;
  },

  defaultRedirectLogEvent (ctx) {
    return {
      'request': {
        'method': ctx.request.method,
        'url': ctx.request.url,
        'referer': ctx.request.header['referer'],
        'userAgent': ctx.request.header['user-agent'],
      },
      'response': {
        'location': ctx.response.header['location'],
      },
      'target': ctx.request.query.target,
      'search': ctx.request.query.search,
      'scope': ctx.request.query.scope,
      'field': ctx.request.query.field,
      'sessionId': ctx.session.id,
    };
  },
})
.init(function () {
  const factory = require(path.resolve(__dirname, 'uri-factory/'))(this.uriFactoryPlugins);
  const sessionId = this.sessionId;
  const redirectLogger = this.redirectLogger();
  const errorLogger = this.errorLogger();
  const defaultRedirectLogEvent = this.defaultRedirectLogEvent;
  const redirectLogEvent = this.redirectLogEvent;

  router.get(this.uriPathPrefix, co(function *redirect (ctx, next) {
    yield next();
    const [warning, uri] = yield factory.uriFor(ctx.request.query);
    ctx.status = 302;
    ctx.redirect(uri.href());
    if (warning) {
      redirectLogger.warn({'event': redirectLogEvent(ctx, defaultRedirectLogEvent(ctx))}, warning);
    } else {
      redirectLogger.info({'event': redirectLogEvent(ctx, defaultRedirectLogEvent(ctx))}, 'ok');
    }
  }));

  const app = new Koa();
  app
    .use(favicon(this.favicon))
    .use(convert(session(this.sessionOpts, app)))
    .use(co(function *session (ctx, next) {
      ctx.session.id = yield sessionId(ctx);
      yield next();
    }))
    .use(router.routes())
    .use(router.allowedMethods())
    .on('error', (err, ctx) => {
      if (err instanceof InvalidArgumentError) {
        err.status = ctx.status = 400;
        errorLogger.warn({'event': redirectLogEvent(ctx)}, err.message);
      } else {
        errorLogger.error({'error': err}, err.message);
      }
    });

  return app;
});
