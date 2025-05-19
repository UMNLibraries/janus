'use strict'
import test from 'tape';
import stampit from 'stampit';
import fooPlugin from './fixtures/foo-plugin.js';
import barPlugin from './fixtures/bar-plugin.js';
import metaFactory from '../uri-factory/index.js';
import InvalidArgumentError from '../invalid-arg-error.js';

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

  fooUriResult = await factory.uriFor({ TARGET: 'foo', sEArch: 'baz', ScOpE: 'music', FIELD: 'author', FOrmAT: 'video' })
  t.equal(
    fooUriResult[1].href(),
    'https://foo.com?search=baz&scope=music&field=author&format=video',
    'all supported param names are case-insensitive'
  )

  fooUriResult = await factory.uriFor({ params: 'foo|music|audio', search: 'palestrina' })
  t.equal(
    fooUriResult[1].href(),
    'https://foo.com?search=palestrina&scope=music&format=audio',
    'pipe-delimited params= are supported'
  )

  fooUriResult = await factory.uriFor({ params: 'foo||audio', search: 'palestrina' })
  t.equal(
    fooUriResult[1].href(),
    'https://foo.com?search=palestrina&format=audio',
    'pipe-delimited params= may omit values between delimiters'
  )

  fooUriResult = await factory.uriFor({ params: 'foo', search: 'palestrina' })
  t.equal(
    fooUriResult[1].href(),
    'https://foo.com?search=palestrina',
    'pipe-delimited params= may omit all delimiters, supplying only target'
  )

  fooUriResult = await factory.uriFor({ params: 'foo|music|audio', search: 'palestrina', target: 'bar', format: 'video' })
  t.equal(
    fooUriResult[1].href(),
    'https://foo.com?search=palestrina&scope=music&format=audio',
    'pipe-delimited params= override individually supplied query values'
  )

  fooUriResult = await factory.uriFor({ ParAmS: 'foo|music|audio', search: 'palestrina' })
  t.equal(
    fooUriResult[1].href(),
    'https://foo.com?search=palestrina&scope=music&format=audio',
    'pipe-delimited params= is case-insensitive'
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
