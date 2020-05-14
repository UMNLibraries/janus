'use strict'
const stampit = require('stampit')
const URI = require('urijs')

module.exports = stampit()
  .props({
    emptySearchWarning: 'Missing or empty search expression.',
    badScopeWarning: 'Unrecognized scope: ',
    badFieldWarning: 'Unrecognized field: ',
    badFormatWarning: 'Unrecognized format: '
  })
  .methods({
  // Though some of these methods will likely do nothing except return objects
  // or data structures, we do not implement them as props, because those would
  // be more difficult, if not impossible in some cases, to override.
  // See the test/fixtures for more example implementations.

    fields () {
      return {
        author: 'author',
        title: 'title',
        subject: 'subject'
      }
    },

    scopes () {
      return {}
    /* example override implementation:
    {
      business: 'Business Library',
      math: 'Math Library',
      music: 'Music Library',
    };
    */
    },

    formats () {
      return {}
    /* example override implementation:
    {
      audio: 'Audio recordings',
      books: 'Books',
      scores: 'Music scores'
      video: 'Video recordings',
    }
    */
    },

    baseUri () {
      return URI()
    /* example override implementation:
    return URI({
      protocol: 'https',
      hostname: 'example.com',
    });
    */
    },

    emptySearchUri () {
      return this.baseUri()
    },

    uriFor (search, scope, field, format) {
      if (!search) {
        return [
          this.emptySearchWarning,
          this.emptySearchUri()
        ]
      }
      const params = { search: search }
      const warnings = []

      if (scope) {
        if (scope in this.scopes()) {
          params.scope = scope
        } else {
          warnings.push(this.badScopeWarning + `"${scope}"`)
        }
      }

      if (field) {
        if (field in this.fields()) {
          params.field = field
        } else {
          warnings.push(this.badFieldWarning + `"${field}"`)
        }
      }

      if (format) {
        if (format in this.formats()) {
          params.format = format
        } else {
          warnings.push(this.badFormatWarning + `"${format}"`)
        }
      }

      return [
        warnings.join(' '),
        this.baseUri().addQuery(params)
      ]
    }
  })
