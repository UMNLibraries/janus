'use strict'
const InvalidArgumentError = require('../invalid-arg-error')
const stampit = require('stampit')

module.exports = stampit()
  .methods({
    uriFor (params) {
      const factory = this
      return new Promise(function (resolve, reject) {
        const target = params.target ? params.target.toLowerCase() : params.target
        if (!Reflect.has(factory, target)) {
          reject(new InvalidArgumentError(`no plugin defined for target '${target}'`))
        }
        const plugin = factory[target]
        resolve(plugin.uriFor(params.search, params.scope, params.field, params.format))
      })
    }
  }).init(function (plugins) {
    const factory = this
    for (const [pluginName, pluginFactory] of Object.entries(plugins)) {
      const plugin = pluginFactory()
      if (!(Reflect.has(plugin, 'uriFor') && (Reflect.getPrototypeOf(plugin.uriFor) === Function.prototype))) {
        throw new InvalidArgumentError(`plugin "${pluginName}" has no uriFor() method`)
      }
      factory[pluginName.toLowerCase()] = plugin
    }
  })
