'use strict'
const stampit = require('stampit')
const got = require('got')
const playwright = require('playwright')

module.exports = stampit()
  .props({
    runIntegrationTests: false
  })
  .methods({
    baseUri: async function (t, plugin, expectedHref) {
      const uri = plugin.baseUri()

      t.equal(
        uri.href(),
        expectedHref,
        'expected baseUri href (' + expectedHref + ')...'
      )

      if (this.runIntegrationTests) {
        const response = await got(uri.href())
        t.equal(response.statusCode, 200, '...and request for baseUri href is successful')
      }

      t.end()
    },

    emptySearchUri: async function (t, plugin, expectedHref) {
      const uri = plugin.emptySearchUri()

      t.equal(
        uri.href(),
        expectedHref,
        'expected emptySearchUri href (' + expectedHref + ')...'
      )

      if (this.runIntegrationTests) {
        const response = await got(uri.href())
        t.equal(response.statusCode, 200, '...and request for emptySearchUri href is successful')
      }

      t.end()
    },

    missingSearchArgs: function (t, plugin, testCases) {
      for (const argumentStates in testCases) {
        (function () {
          const conditions = argumentStates
          const args = testCases[conditions]
          const expectedHref = plugin.emptySearchUri().href()

          const [warning, uri] = plugin.uriFor(args.search, args.scope, args.field)
          t.equal(uri.href(), expectedHref, 'when ' + conditions + ', we get expected href (' + expectedHref + ')...')
          t.equal(warning, 'Missing or empty search expression.', '...and expected warning returned for a missing search expression')
        })()
      }
      t.end()
    },

    invalidFieldArgs: function (t, plugin, expectedHref) {
      const [warning, uri] = plugin.uriFor('darwin', null, 'bogus')
      t.equal(uri.href(), expectedHref, 'expected href (' + expectedHref + ') for an invalid "field" value...')
      t.equal(warning, 'Unrecognized field: "bogus"', '...and expected warning for an invalid "field" value')
      t.end()
    },

    invalidScopeArgs: function (t, plugin, expectedHref) {
      const [warning, uri] = plugin.uriFor('darwin', 'bogus', null)
      t.equal(uri.href(), expectedHref, 'expected href (' + expectedHref + ') for an invalid "scope" value...')
      t.equal(warning, 'Unrecognized scope: "bogus"', '...and expected warning for an invalid "scope" value')
      t.end()
    },

    invalidFormatArgs: function (t, plugin, expectedHref) {
      const [warning, uri] = plugin.uriFor('darwin', null, null, 'bogus')
      t.equal(uri.href(), expectedHref, 'expected href (' + expectedHref + ') for an invalid "format" value...')
      t.equal(warning, 'Unrecognized format: "bogus"', '...and expected warning for an invalid "format" value')
      t.end()
    },

    validSearchArgs: async function (t, plugin, testCases, getResultCount) {
      for (const expectedHref in testCases) {
        const args = testCases[expectedHref]
        const [warning, uri] = plugin.uriFor(args.search, args.scope, args.field, args.format)

        const href = uri.href()
        t.equal(href, expectedHref, 'expectedHref (' + expectedHref + ') for valid args search: ' + args.search + ', scope: ' + args.scope + ', field: ' + args.field + ', format: ' + args.format + '...')
        t.false(warning, '...and no warning returned...')

        if (this.runIntegrationTests) {
          const browser = await playwright.chromium.launch({
            headless: true
          })
          const page = await browser.newPage()
          const results = await Promise.all([
            page.goto(href),
            page.waitForEvent('response', response => response.request().resourceType() === 'document')
          ])
          const response = results.pop()
          t.equal(response.status(), 200, '...and request for href (' + href + ') is successful...')
          const count = await getResultCount(page)
          t.ok((count > 0), '...and request for href (' + href + ') returns 1 or more (' + count + ') records')
          await browser.close()
        }
      }

      t.end()
    }
  })
  .init(function () {
    if (process.env.RUN_INTEGRATION_TESTS) {
      this.runIntegrationTests = true
    }
  })
