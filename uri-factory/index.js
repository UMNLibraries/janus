'use strict';
const InvalidArgumentError = require('../invalid-arg-error');
const stampit = require('stampit');

module.exports = stampit()
.methods({
  uriFor (params) {
    const factory = this;
    return new Promise(function (resolve, reject) {
      if (!Reflect.has(factory, params.target)) {
        reject(new InvalidArgumentError(`no plugin defined for target '${params.target}'`));
      }
      const plugin = factory[params.target];
      resolve(plugin.uriFor(params.search, params.scope, params.field));
    });
  },
}).init(function () {
  const factory = this;
  for (let pluginName of Reflect.ownKeys(factory)) {
    let plugin = factory[pluginName]();
    if (!(Reflect.has(plugin, 'uriFor') && (Reflect.getPrototypeOf(plugin['uriFor']) === Function.prototype))) {
      throw new InvalidArgumentError(`plugin "${pluginName}" has no uriFor() method`);
    }
    factory[pluginName] = plugin;
  }
});
