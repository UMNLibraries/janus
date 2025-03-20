'use strict'
import stampit from 'stampit';
import URI from 'urijs';
import plugin from '../../uri-factory/plugin.js';

const pubmed = stampit()
  .methods({
    fields () { return {} },
    baseUri () {
      return URI({
        protocol: 'https',
        hostname: 'www.ncbi.nlm.nih.gov'
      }).query({
        db: 'pubmed',
        otool: 'janus-tests'
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
        this.baseUri().addQuery({ term: search })
      ]
    }
  })

export default plugin.compose(pubmed);
