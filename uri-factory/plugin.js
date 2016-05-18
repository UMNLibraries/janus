'use strict';
const stampit = require('stampit');
const URI = require('urijs');

module.exports = stampit()
.props({
  emptySearchWarning: 'Missing or empty search expression.', 
  badScopeWarning: 'Unrecognized scope: ',
  badFieldWarning: 'Unrecognized field: ',
})
.methods({
  // Though some of these methods will likely do nothing except return objects
  // or data structures, we do not implement them as props, because those would
  // be more difficult, if not impossible in some cases, to override.
  // See the test/fixtures for more example implementations.

  fields() {
    return {
      author: 'author',
      title: 'title',
      subject: 'subject',
    };
  },

  scopes() {
    return {};
    /* example override implementation:
    {
      business: 'Business Library',
      math: 'Math Library',
      music: 'Music Library',
    };
    */
  },

  baseUri() {
    return URI();
    /* example override implementation:
    return URI({
      protocol: 'https',
      hostname: 'example.com',
    });
    */
  },

  emptySearchUri() {
    return this.baseUri();
  },

  uriFor(search, scope, field) {
    if (!search) {
      return [
        this.emptySearchWarning,
        this.emptySearchUri(),
      ];
    }
    const params = {search: search};
    const warnings = [];

    if (scope) {
      if (scope in this.scopes()) {
        params['scope'] = scope;
      } else {
        warnings.push(this.badScopeWarning + `"${scope}"`);
      }
    }
      
    if (field) {
      if (field in this.fields()) {
        params['field'] = field;
      } else {
        warnings.push(this.badFieldWarning + `"${field}"`);
      }    
    }

    return [
      warnings.join(' '),
      this.baseUri().addQuery(params),
    ];
  },
});
