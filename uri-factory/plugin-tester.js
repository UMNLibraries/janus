'use strict'
const stampit = require('stampit')
const playwright = require('playwright')

module.exports = stampit()
  .props({
    runIntegrationTests: false
  })
  .methods({
    baseUri: async function (t, plugin, expectedHref) {
      const href = plugin.baseUri().href()

      t.equal(
        href,
        expectedHref,
        'expected baseUri href (' + expectedHref + ')...'
      )

      if (this.runIntegrationTests) {
        const results = await this.gotoPage(href).catch(e => { console.error(e) })
        const response = results.pop()
        t.equal(response.status(), 200, '...and request for baseUri href is successful...')
      }

      t.end()
    },

    emptySearchUri: async function (t, plugin, expectedHref) {
      const href = plugin.emptySearchUri().href()

      t.equal(
        href,
        expectedHref,
        'expected emptySearchUri href (' + expectedHref + ')...'
      )

      if (this.runIntegrationTests) {
        const results = await this.gotoPage(href).catch(e => { console.error(e) })
        const response = results.pop()
        t.equal(response.status(), 200, '...and request for emptySearchUri href is successful...')
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
          const [page, response] = await this.gotoPage(href).catch(e => { console.error(e) })
          t.equal(response.status(), 200, '...and request for href (' + href + ') is successful...')
          const count = await getResultCount(page).catch(e => { console.error(e) })
          t.ok((count > 0), '...and request for href (' + href + ') returns 1 or more (' + count + ') records')
        }
      }

      t.end()
    },

    setup: async function () {
      this.browser = await playwright.chromium.launch({ headless: true }).catch(e => { console.error(e) })
    },

    gotoPage: async function (href) {
      const page = await this.browser.newPage().catch(e => { console.error(e) })
      const results = await Promise.all([
        page.goto(href),
        page.waitForEvent('response', response => response.request().resourceType() === 'document')
      ]).catch(e => { console.error(e) })
      const response = results.pop()
      return [page, response]
    },

    teardown: async function () {
      await this.browser.close().catch(e => { console.error(e) })
    }
  })
  .init(function () {
    if (process.env.RUN_INTEGRATION_TESTS) {
      this.runIntegrationTests = true
    }
  })
