'use strict'
const test = require('tape')
const plugin = require('./fixtures/pubmed-plugin')()
const tester = require('../uri-factory/plugin-tester')({ runIntegrationTests: false })

test('setup', async function (t) {
  await tester.setup()
})

test('pubmed-plugin scopes override', function (t) {
  t.deepEqual(plugin.scopes(), {}, 'scopes correctly overridden with an empty object')
  t.end()
})

test('pubmed-plugin fields override', function (t) {
  t.deepEqual(plugin.fields(), {}, 'fields correctly overridden with an empty object')
  t.end()
})

test('pubmed-plugin baseUri()', function (t) {
  tester.baseUri(t, plugin, 'https://www.ncbi.nlm.nih.gov?db=pubmed&otool=janus-tests')
})

test('pubmed-plugin emptySearchUri()', function (t) {
  tester.emptySearchUri(t, plugin, 'https://www.ncbi.nlm.nih.gov?db=pubmed&otool=janus-tests')
})

test('pubmed-plugin uriFor() missing "search" arguments', function (t) {
  // testCases map state descriptions to uriFor() arguments
  const testCases = {
    'all arguments are null': {
      search: null,
      scope: null,
      field: null
    }
  }
  tester.missingSearchArgs(t, plugin, testCases)
})

test('pubmed-plugin uriFor() valid "search" arguments', function (t) {
  // testCases map expected uri to uriFor() arguments
  const testCases = {
    'https://www.ncbi.nlm.nih.gov?db=pubmed&otool=janus-tests&term=neoplasm': {
      search: 'neoplasm',
      scope: null,
      field: null
    }
  }

  async function getResultCount (page) {
    return await page.$eval(
      '#search-results > .results-amount-container > .results-amount > .value',
      elem => { return elem.textContent.replace(/,/g, '') }
    )
  }

  tester.validSearchArgs(t, plugin, testCases, getResultCount)
})

test('teardown', async function (t) {
  await tester.teardown()
})
