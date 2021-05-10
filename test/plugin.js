'use strict'
const test = require('tape')
const plugin = require('./fixtures/foo-plugin')()
const tester = require('../uri-factory/plugin-tester')()
tester.runIntegrationTests = false

test('plugin baseUri()', function (t) {
  tester.baseUri(t, plugin, 'https://foo.com')
})

test('plugin emptySearchUri()', function (t) {
  tester.emptySearchUri(t, plugin, 'https://foo.com')
})

test('plugin uriFor() missing "search" arguments', function (t) {
  // testCases map state descriptions to simpleSearch arguments
  const testCases = {
    'all arguments are null': {
      search: null,
      scope: null,
      field: null
    },
    'only "subject" argument has a truthy value': {
      search: '',
      scope: null,
      field: 'subject'
    },
    'only "scope" argument has a truthy value': {
      search: false,
      scope: 'math',
      field: null
    },
    'both "scope" and "field" arguments have truthy values': {
      search: 0,
      scope: 'music',
      field: 'title'
    }
  }
  tester.missingSearchArgs(t, plugin, testCases)
})

test('plugin invalid field args', function (t) {
  tester.invalidFieldArgs(t, plugin, 'https://foo.com?search=darwin')
})

test('plugin invalid format args', function (t) {
  tester.invalidFormatArgs(t, plugin, 'https://foo.com?search=darwin')
})

test('plugin invalid scope args', function (t) {
  tester.invalidScopeArgs(t, plugin, 'https://foo.com?search=darwin')
})

test('plugin simpleSearch() valid "search" arguments', function (t) {
  // testCases map expectedUrl to simpleSearch arguments
  const testCases = {
    'https://foo.com?search=darwin': {
      search: 'darwin',
      scope: null,
      field: null
    },
    'https://foo.com?search=darwin&field=subject': {
      search: 'darwin',
      scope: null,
      field: 'subject'
    },
    'https://foo.com?search=darwin&scope=math': {
      search: 'darwin',
      scope: 'math',
      field: null
    },
    'https://foo.com?search=darwin&scope=music&field=title': {
      search: 'darwin',
      scope: 'music',
      field: 'title'
    }
  }

  tester.validSearchArgs(t, plugin, testCases, function () {})
})
