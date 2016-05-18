'use strict';
const stampit = require('stampit');
const URI = require('urijs');
const plugin = require('../../uri-factory/plugin');

const bar = stampit()
.methods({
  fields() { return {}; },
  baseUri() {
    return URI({
      protocol: 'https',
      hostname: 'bar.com',
    });
  },
  uriFor(search, scope, field) {
    if (!search) {
      return [
        this.emptySearchWarning,
        this.emptySearchUri(),
      ];
    }
    return [
      '',
      this.baseUri().addQuery({search: search}),
    ];
  },
});

module.exports = plugin.compose(bar);
