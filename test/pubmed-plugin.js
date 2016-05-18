'use strict'
//const test = require('blue-tape').test
const test = require('tape')
const cheerio = require('cheerio')
const plugin = require('./fixtures/pubmed-plugin')()
const tester = require('../uri-factory/plugin-tester')({runIntegrationTests: false})

test('pubmed-plugin scopes override', function (t) {
  t.deepEqual(plugin.scopes(), {}, 'scopes correctly overridden with an empty object')
  t.end()
})

test('pubmed-plugin fields override', function (t) {
  t.deepEqual(plugin.fields(), {}, 'fields correctly overridden with an empty object')
  t.end()
})

test('pubmed-plugin baseUri()', function (t) {
  tester.baseUri(t, plugin, 'https://www.ncbi.nlm.nih.gov/sites/entrez?db=pubmed&otool=biblio-search-uri-tests')
})

test('pubmed-plugin emptySearchUri()', function (t) {
  tester.emptySearchUri(t, plugin, 'https://www.ncbi.nlm.nih.gov/sites/entrez?db=pubmed&otool=biblio-search-uri-tests')
})

test ('pubmed-plugin uriFor() missing "search" arguments', function (t) {
  // testCases map state descriptions to uriFor() arguments
  const testCases = {
    'all arguments are null': {
      search: null,
      scope: null,
      field: null,
    },
  }
  tester.missingSearchArgs(t, plugin, testCases)
})

test ('pubmed-plugin uriFor() valid "search" arguments', function (t) {
  // testCases map expected uri to uriFor() arguments
  const testCases = {
    'https://www.ncbi.nlm.nih.gov/sites/entrez?db=pubmed&otool=biblio-search-uri-tests&term=neoplasm': {
      search: 'neoplasm',
      scope: null,
      field: null,
    },
  }

  function getResultCount(html) {
    const $ = cheerio.load(html)
    const count = $('#resultcount').attr('value')
    return count
  }

  tester.validSearchArgs(t, plugin, testCases, getResultCount)
})
