'use strict'
const InvalidArgumentError = require('../invalid-arg-error')
const stampit = require('stampit')

module.exports = stampit()
  .props({
    // Special param "params=" pipe delimited targetvalue|scopevalue|formatvalue
    supportedQueryParamNames: ['target', 'search', 'scope', 'field', 'format', 'params']
  })
  .methods({

    normalizeQueryParams (rawParams, supportedOnly = false) {
      const params = {}
      const delimParamsKey = Object.keys(rawParams).find(k => k.toLowerCase() === 'params')

      for (const [key, value] of Object.entries(rawParams)) {
        const lcKey = key.toLowerCase()
        if (this.supportedQueryParamNames.includes(lcKey)) {
          params[lcKey] = value
        } else if (!supportedOnly) {
          params[key] = value
        }
      }
      // Take all values from delimited params if present, supercede parameters other than search
      // if they had also been present
      if (delimParamsKey) {
        [
          params.target,
          params.scope,
          params.format
        ] = rawParams[delimParamsKey].split('|').map(v => v.replace(/\s*$/, ''))
        // Prior loop sets the delimited string when not in supportedOnly mode
        // Eliminate it
        delete params[delimParamsKey]
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
