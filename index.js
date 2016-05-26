'use strict';
const stampit = require('stampit');
const Koa = require('koa');
const favicon = require('koa-favicon');
const router = require('koa-router')();
const co = require('bluebird').coroutine;
const bunyan = require('bunyan');
const InvalidArgumentError = require(__dirname + '/invalid-arg-error');

module.exports = stampit()
.props({
  favicon: __dirname + '/public/favicon.ico',
  port: 8000,
  uriFactoryPlugins: {},
  redirectLog: __dirname + '/log/redirect.json',
  errorLog: __dirname + '/log/error.json',
})
.methods({
  redirectLogger() { 
    return bunyan.createLogger({
      name: 'redirect',
      streams: [{
        //level: 'info',
        path: this.redirectLog,
      }],
    });
  },

  errorLogger() {
    return bunyan.createLogger({
      name: 'error',
      streams: [{
        level: 'info',
        path: this.errorLog,
      }],
    });
  },
})
.init(function () {
  const factory = require('./uri-factory/')(this.uriFactoryPlugins);
  const redirectLogger = this.redirectLogger();
  const errorLogger = this.errorLogger();
  const event = this.event;

  router.get('/', co(function* (ctx, next) {
    yield next();
    const [warning, uri] = yield factory.uriFor(ctx.request.query);
    ctx.status = 302;
    ctx.redirect(uri.href());
    const newEvent = event(ctx);
    if (warning) {
      redirectLogger.warn({'event': newEvent}, warning);
    } else {
      redirectLogger.info({'event': newEvent}, 'ok');
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
        const newEvent = event(ctx);
        errorLogger.warn({'event': newEvent}, err.message);
      } else {
        errorLogger.error({'error': err}, err.message);
      }
    });

  app.listen(this.port);
});
