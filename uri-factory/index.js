'use strict';
const InvalidArgumentError = require('../invalid-arg-error');
const stampit = require('stampit');

module.exports = stampit()
.methods({
  uriFor (params) {
    const factory = this;
    return new Promise(function (resolve, reject) {
      const target = params.target ? params.target.toLowerCase() : params.target;
      if (!Reflect.has(factory, target)) {
        reject(new InvalidArgumentError(`no plugin defined for target '${target}'`));
      }
      const plugin = factory[target];
      resolve(plugin.uriFor(params.search, params.scope, params.field));
    });
  },
}).init(function () {
  const factory = this;
  for (let pluginName of Reflect.ownKeys(factory)) {
    let plugin = factory[pluginName.toLowerCase()]();
    if (!(Reflect.has(plugin, 'uriFor') && (Reflect.getPrototypeOf(plugin['uriFor']) === Function.prototype))) {
      throw new InvalidArgumentError(`plugin "${pluginName}" has no uriFor() method`);
    }
    factory[pluginName] = plugin;
  }
});
