'use strict';
const stampit = require('stampit');
const Koa = require('koa');
const favicon = require('koa-favicon');
const co = require('bluebird').coroutine;

module.exports = stampit()
.props({
  favicon: __dirname + '/public/favicon.ico',
  port: 8000,
  uriFactoryPlugins: {},
})
.init(function () {
  const factory = require('./uri-factory/')(this.uriFactoryPlugins);
  const router = require('koa-router')();

  router.get('/', co(function* (ctx, next) {
    yield next();
    const [warning, uri] = yield factory.uriFor(ctx.request.query);
    ctx.redirect(uri.href());
    ctx.status = 301;
  }));

  const app = new Koa();
  app
    .use(favicon(this.favicon))
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(this.port);
})
