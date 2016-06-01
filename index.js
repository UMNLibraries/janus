'use strict';
const path = require('path');
const stampit = require('stampit');
const Koa = require('koa');
const favicon = require('koa-favicon');
const router = require('koa-router')();
const co = require('bluebird').coroutine;
const bunyan = require('bunyan');
const InvalidArgumentError = require(path.resolve(__dirname, 'invalid-arg-error'));

module.exports = stampit()
.props({
  uriFactoryPlugins: {},
  favicon: path.resolve(__dirname, 'public/favicon.ico'),
  redirectLog: path.resolve(__dirname, 'logs/redirect.json'),
  redirectLogName: 'redirect',
  redirectLogLevel: 'info',
  errorLog: path.resolve(__dirname, 'logs/error.json'),
  errorLogName: 'error',
  errorLogLevel: 'info',
})
.methods({
  errorLogger () {
    return bunyan.createLogger({
      name: this.errorLogName,
      streams: [{
        level: this.errorLogLevel,
        path: this.errorLog,
      }],
    });
  },

  redirectLogger () {
    return bunyan.createLogger({
      name: this.redirectLogName,
      streams: [{
        level: this.redirectLogLevel,
        path: this.redirectLog,
      }],
    });
  },

  redirectLogEvent (ctx) {
    return {
      'request': {
        'method': ctx.req.method,
        'url': ctx.req.url,
        'referer': ctx.req.headers['referer'],
        'userAgent': ctx.req.headers['user-agent'],
      },
      'target': ctx.request.query.target,
      'search': ctx.request.query.search,
      'scope': ctx.request.query.scope,
      'field': ctx.request.query.field,
    };
  },
})
.init(function () {
  const factory = require(path.resolve(__dirname, 'uri-factory/'))(this.uriFactoryPlugins);
  const redirectLogger = this.redirectLogger();
  const errorLogger = this.errorLogger();
  const redirectLogEvent = this.redirectLogEvent;

  router.get('/', co(function *redirect (ctx, next) {
    yield next();
    const [warning, uri] = yield factory.uriFor(ctx.request.query);
    ctx.status = 302;
    ctx.redirect(uri.href());
    if (warning) {
      redirectLogger.warn({'event': redirectLogEvent(ctx)}, warning);
    } else {
      redirectLogger.info({'event': redirectLogEvent(ctx)}, 'ok');
    }
  }));

  const app = new Koa();
  app
    .use(favicon(this.favicon))
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
