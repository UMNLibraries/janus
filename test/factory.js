'use strict'
const test = require('tape')
const stampit = require('stampit')
const fooPlugin = require('./fixtures/foo-plugin')
const barPlugin = require('./fixtures/bar-plugin')
const metaFactory = require('../uri-factory/')
const InvalidArgumentError = require('../invalid-arg-error')

test('factory invalid plugins', function (t) {
  try {
    metaFactory({ foo: {} })
  } catch (e) {
    t.ok(
      (e instanceof TypeError),
      'factory method throws a TypeError for a plugin that is not a function...'
    )
    t.ok(
      (/not a function/.exec(e.message)),
      '...and the error message says the plugin is not a function'
    )
  }

  try {
    metaFactory({ foo: function () { return 'not an object' } })
  } catch (e) {
    t.ok(
      (e instanceof TypeError),
      'factory method throws a TypeError for a plugin function that does not return an object...'
    )
    t.ok(
      (/called on non-object/.exec(e.message)),
      '...and the error message reports a method call on a non-object'
    )
  }

  try {
    metaFactory({ foo: stampit() })
  } catch (e) {
    t.ok(
      (e instanceof InvalidArgumentError),
      'factory method throws an InvalidArgumentError for a plugin without a uriFor() method...'
    )
    t.ok(
      (e.message === 'plugin "foo" has no uriFor() method'),
      '...and the error message reports that the plugin is missing the required method...'
    )
    t.ok(
      (e instanceof Error),
      '...and InvalidArgumentError is an instance of Error'
    )
  }
  t.end()
})

test('factory uriFor()', async function (t) {
  const factory = metaFactory({
    FOO: fooPlugin,
    bar: barPlugin
  })

  let fooUriResult = await factory.uriFor({ target: 'FOO', search: 'manchoo', scope: 'business', field: 'author', format: 'audio' })
  t.equal(
    fooUriResult[1].href(),
    'https://foo.com?search=manchoo&scope=business&field=author&format=audio',
    'expected href for target "FOO"'
  )

  fooUriResult = await factory.uriFor({ target: 'foo', search: 'manchoo' })
  t.equal(
    fooUriResult[1].href(),
    'https://foo.com?search=manchoo',
    'target is case-insensitive: factory param "FOO" works with uriFor() param "foo"'
  )

  let barUriResult = await factory.uriFor({ target: 'bar', search: 'baz' })
  t.equal(
    barUriResult[1].href(),
    'https://bar.com?search=baz',
    'expected href for target "bar"'
  )

  barUriResult = await factory.uriFor({ target: 'BAR', search: 'baz' })
  t.equal(
    barUriResult[1].href(),
    'https://bar.com?search=baz',
    'target is case-insensitive: factory param "bar" works with uriFor() param "BAR"'
  )

  try {
    await factory.uriFor({ target: 'bogus', search: 'bogus' })
  } catch (e) {
    t.ok(
      (e instanceof InvalidArgumentError),
      'uriFor() throws an InvalidArgumentError for an unknown target'
    )
  }
})
