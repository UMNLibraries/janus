'use strict'
const stampit = require('stampit')
const URI = require('urijs')
const plugin = require('../../uri-factory/plugin')

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

module.exports = plugin.compose(pubmed)
