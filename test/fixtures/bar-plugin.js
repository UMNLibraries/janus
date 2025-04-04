'use strict'
import stampit from 'stampit';
import URI from 'urijs';
import plugin from '../../uri-factory/plugin.js';

const bar = stampit()
  .methods({
    fields () { return {} },
    baseUri () {
      return URI({
        protocol: 'https',
        hostname: 'bar.com'
      })
    },
    uriFor (search, scope, field) {
      if (!search) {
        return [
          this.emptySearchWarning,
          this.emptySearchUri()
        ]
      }
      return [
        '',
        this.baseUri().addQuery({ search: search })
      ]
    }
  })

export default plugin.compose(bar);
