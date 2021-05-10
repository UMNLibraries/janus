'use strict'
const InvalidArgumentError = require('../invalid-arg-error')
const stampit = require('stampit')

module.exports = stampit()
  .props({
    supportedQueryParamNames: ['target', 'search', 'scope', 'field', 'format']
  })
  .methods({

    normalizeQueryParams (rawParams, supportedOnly = false) {
      const params = {}
      for (const [key, value] of Object.entries(rawParams)) {
        const lcKey = key.toLowerCase()
        if (this.supportedQueryParamNames.includes(lcKey)) {
          params[lcKey] = value
        } else if (!supportedOnly) {
          params[key] = value
        }
      }
      return params
    },

    uriFor (rawParams) {
      const factory = this
      const params = this.normalizeQueryParams(rawParams)
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
