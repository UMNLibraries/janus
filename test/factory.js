'use strict';
const test = require('blue-tape').test;
const co = require('bluebird').coroutine;
const stampit = require('stampit');
const fooPlugin = require('./fixtures/foo-plugin');
const barPlugin = require('./fixtures/bar-plugin');
const metaFactory = require('../uri-factory/');
const InvalidArgumentError = require('../invalid-arg-error');

test('factory invalid plugins', function (t) {
  try {
    const factory = metaFactory({foo: {}});
  } catch (e) {
    t.ok(
      (e instanceof TypeError),
      'factory method throws a TypeError for a plugin that is not a function...'
    );
    t.ok(
      (/not a function/.exec(e.message)),
      '...and the error message says the plugin is not a function'
    );
  }

  try {
    const factory = metaFactory({foo: new Function()});
  } catch (e) {
    t.ok(
      (e instanceof TypeError),
      'factory method throws a TypeError for a plugin function that does not return an object...'
    );
    t.ok(
      (/called on non-object/.exec(e.message)),
      '...and the error message reports a method call on a non-object'
    );
  }

  try {
    const factory = metaFactory({foo: stampit()});
  } catch (e) {
    t.ok(
      (e instanceof InvalidArgumentError),
      'factory method throws an InvalidArgumentError for a plugin without a uriFor() method...'
    );
    t.ok(
      (e.message === 'plugin "foo" has no uriFor() method'),
      '...and the error message reports that the plugin is missing the required method...'
    );
    t.ok(
      (e instanceof Error),
      '...and InvalidArgumentError is an instance of Error'
    );
  }
  t.end();
});

test('factory uriFor()', co(function *(t) {
  const factory = metaFactory({
    FOO: fooPlugin,
    bar: barPlugin,
  });

  let [fooWarning, fooUri] = yield factory.uriFor({target: 'FOO', search: 'manchoo', scope: 'business', field: 'author'});
  t.equal(
    fooUri.href(),
    'https://foo.com?search=manchoo&scope=business&field=author',
    'expected href for target "FOO"'
  );

  [fooWarning, fooUri] = yield factory.uriFor({target: 'foo', search: 'manchoo'});
  t.equal(
    fooUri.href(),
    'https://foo.com?search=manchoo',
    'target is case-insensitive: factory param "FOO" works with uriFor() param "foo"'
  );

  let [barWarning, barUri] = yield factory.uriFor({target: 'bar', search: 'baz'});
  t.equal(
    barUri.href(),
    'https://bar.com?search=baz',
    'expected href for target "bar"'
  );

  [barWarning, barUri] = yield factory.uriFor({target: 'BAR', search: 'baz'});
  t.equal(
    barUri.href(),
    'https://bar.com?search=baz',
    'target is case-insensitive: factory param "bar" works with uriFor() param "BAR"'
  );

  try {
    const [bogusWarning, bogusUri] = yield factory.uriFor({target: 'bogus', search: 'bogus'});
  } catch (e) {
    t.ok(
      (e instanceof InvalidArgumentError),
      'uriFor() throws an InvalidArgumentError for an unknown target'
    );
  }
}));
