'use strict';
const stampit = require('stampit');
const Bluebird = require('bluebird');
const co = Bluebird.coroutine;
const request = Bluebird.promisifyAll(require('request'));
Bluebird.longStackTraces();

module.exports = stampit()
.props({
  runIntegrationTests: false,
})
.methods({
  baseUri: co(function* (t, plugin, expectedHref) {
    const uri = plugin.baseUri();

    t.equal(
      uri.href(),
      expectedHref,
      'expected baseUri href (' + expectedHref + ')...'
    );

    if (this.runIntegrationTests) {
      const [response] = yield request.getAsync(uri.href());
      t.equal(response.statusCode, 200, '...and request for baseUri href is successful');
    }

    t.end();
  }),

  emptySearchUri: co(function* (t, plugin, expectedHref) {
    const uri = plugin.emptySearchUri();

    t.equal(
      uri.href(),
      expectedHref,
      'expected emptySearchUri href (' + expectedHref + ')...'
    );

    if (this.runIntegrationTests) {
      const [response] = yield request.getAsync(uri.href());
      t.equal(response.statusCode, 200, '...and request for emptySearchUri href is successful');
    }

    t.end();
  }),

  missingSearchArgs: function (t, plugin, testCases) {
    for (let argumentStates in testCases) {
      (function () {
        const conditions = argumentStates;
        const args = testCases[conditions];
        const expectedHref = plugin.emptySearchUri().href();

        const [warning, uri] = plugin.uriFor(args.search, args.scope, args.field);
        t.equal(uri.href(), expectedHref, 'when ' + conditions + ', we get expected href (' + expectedHref + ')...');
        t.equal(warning, 'Missing or empty search expression.', '...and expected warning returned for a missing search expression');
      })()
    }
    t.end();
  },

  invalidFieldArgs: function (t, plugin, expectedHref) {
    const [warning, uri] = plugin.uriFor('darwin', null, 'bogus');
    t.equal(uri.href(), expectedHref, 'expected href (' + expectedHref + ') for an invalid "field" value...');
    t.equal(warning, 'Unrecognized field: "bogus"', '...and expected warning for an invalid "field" value');
    t.end();
  },

  invalidScopeArgs: function (t, plugin, expectedHref) {
    const [warning, uri] = plugin.uriFor('darwin', 'bogus', null);
    t.equal(uri.href(), expectedHref, 'expected href (' + expectedHref + ') for an invalid "scope" value...');
    t.equal(warning, 'Unrecognized scope: "bogus"', '...and expected warning for an invalid "scope" value');
    t.end();
  },

  validSearchArgs: co(function* (t, plugin, testCases, getResultCount) {
    for (let expectedHref in testCases) {
      let args = testCases[expectedHref];
      let [warning, uri] = plugin.uriFor(args.search, args.scope, args.field);

      let href = uri.href();
      t.equal(href, expectedHref, 'expectedHref (' + expectedHref + ') for valid args search: ' + args.search + ', scope: ' + args.scope + ', field: ' + args.field + '...');
      t.false(warning, '...and no warning returned...');

      if (this.runIntegrationTests) {
        let [response, html] = yield request.getAsync(href);
        t.equal(response.statusCode, 200, '...and request for href (' + href + ') is successful...');
        let count = getResultCount(html);
        t.ok((count > 0), '...and request for href (' + href + ') returns 1 or more (' + count + ') records');
      }
    }

    t.end();
  }),
})
.init(function () {
  if (process.env.RUN_INTEGRATION_TESTS) {
    this.runIntegrationTests = true;
  }
});
