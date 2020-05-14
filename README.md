# Janus

[![Build Status](https://secure.travis-ci.org/UMNLibraries/janus.png)](http://travis-ci.org/UMNLibraries/janus)

Common target for all library website search forms. Configurable, extensible, re-usable.

Many library websites have multiple search forms that redirect users to various search engines.
Janus is a common target application for all those searches, allowing for data collection and
other handling of the searches with a single code base.

Janus uses a simple URI API for all search engines, which also makes search forms easier to
write and maintain. For example, at UMN Libraries, Janus transforms this request...

https://stacks.lib.umn.edu/janus?target=mncatdiscovery&search=darwin

...into this MNCAT Discovery (Primo, our library catalog) request:

http://primo.lib.umn.edu/primo_library/libweb/action/dlSearch.do?institution=TWINCITIES&vid=TWINCITIES&indx=1&dym=true&highlight=true&lang=eng&search_scope=mncat_discovery&query=any%2Ccontains%2Cdarwin

## Contents

- [Quick Start](#quick-start)
- [API](#api)
	- [URI API](#uri-api)
	- [Application Factory](#application-factory)
	- [URI Factory Plugins](#uri-factory-plugins)
		- [Example Plugins](#example-plugins)
		- [Re-usable Plugin Components](#re-usable-plugin-components)
		- [Plugin API](#plugin-api)
			- [uriFor([search] [,scope] [,field] [,format])](#uriforsearch-scope-field-format)
			- [baseUri()](#baseuri)
			- [emptySearchUri()](#emptysearchuri)
			- [fields()](#fields)
			- [scopes()](#scopes)
			- [formats()](#formats)
			- [emptySearchWarning](#emptysearchwarning)
			- [badScopeWarning](#badscopewarning)
			- [badFieldWarning](#badfieldwarning)
			- [badFormatWarning](#badformatwarning)
	- [Sessions](#sessions)
	- [Logging](#logging)
		- [redirectLogEvent(ctx)](#redirectlogeventctx)
- [Install](#install)
- [Test](#test)
	- [Lint](#lint)
	- [Integration Tests](#integration-tests)
	- [Unit Tests](#unit-tests)

## Quick Start

One way to quickly try Janus:

1. Install [Node.js](https://nodejs.org/) >= 6.0.0.

2. `git clone` this repo.

3. In the repo directory, use Node.js to run this code:
```javascript
'use strict';
const janus = require('./');
const pubmedPlugin = require('./test/fixtures/pubmed-plugin');
const app = janus({
  uriFactoryPlugins: {pubmed: pubmedPlugin},
});
app.listen(3000);
```

4. Make an HTTP GET request (e.g. in a web browser) for: http://localhost:3000?target=pubmed&search=neoplasm

Janus should write a log message to STDOUT, and redirect the request to PubMed, which should respond with search results for "neoplasm".

To configure and extend Janus for use in your library, see the [API](#api) section below. To see how UMN Libraries configures, extends,
and deployes Janus, see our [janus-deploy](https://github.com/UMNLibraries/janus-deploy) repository.

## API

### URI API

Janus accepts only GET requests, and recognizes these parameters:

* `target`
* `search`
* `scope`
* `field`
* `format`

Any unrecognized parameters will be ignored.

`target` is the only required parameter, and the value, while case-insensitive, must map to a recognized [URI factory plugin](#uri-factory-plugins).
If the `target` value is missing or invalid, Janus cannot redirect, and will return a 400 response.

`search` is the user's search expression. While not required, there is little value in redirecting a user to a search engine without it. If `search`
is missing, Janus will redirect the user to the `target` such that no search will have been attempted yet, and log a warning.

`scope` restricts the `search` to a subset of items available via the `target`. Each plugin may define valid `scope` values. If a `scope`
value is invalid, Janus will still redirect, ignoring the `scope`, and log a warning.

`field` restricts the `search` to one of these common bibliographic metadata items:

* `author`
* `title`
* `subject`

Any other `field` value will cause Janus to ignore it and log a warning.

`format` restricts the search to specific material types or formats available via the `target`. If a `format` is value invalid, Janus will ignore it and log a warning.

### Application Factory

Janus is a [stampit](https://github.com/stampit-org/stampit) factory function that creates a [Koa v2.x](https://github.com/koajs/koa/tree/v2.x) application.
An understanding of those technologies may help, but should not be necessary, to understand the following API sections, i.e. instructions for using Janus.
More advanced use of Janus will likely require understanding those technologies.

Most Janus configuration involves passing a properties object to the factory function:

```javascript
const app = janus({
  uriFactoryPlugins: {
    target1: target1Plugin,
    target2: target2Plugin,
  },
  sessionOpts: {
    // options for koa-session
  },
  redirectLog: {
    // options for bunyan.createLogger()
  },
  errorLog: {
    // options for bunyan.createLogger()
  },
  uriPathPrefix: '/', // Default. Or set it to something custom, like '/janus'.
  favicon: '/path/to/favicon.ico',
});
```

More about some of these properties in the sections below.

### URI Factory Plugins

Janus generates redirect URIs with a factory. The most obvious and powerful way to extend Janus is to create plugins for this factory, one for each
search engine you want to target. The plugins transform Janus request parameters into URIs for search engine targets.

The value of the `uriFactoryPlugins` property must be an object, where the keys are values for the `target` parameter
of the [URI API](#uri-api), and the values are plugins for those targets.

#### Example Plugins

For simple examples, see the `test/fixtures/*plugin.js` files in this repo. For more complex examples, see the
[UMN Libraries plugins](https://github.com/UMNLibraries/janus-uri-factory-plugins).

In most, if not all, cases, reading and modifying existing examples should be sufficient to create your own plugins. A basic understanding of
stampit and [urijs](https://www.npmjs.com/package/urijs) would help, too.

#### Re-usable Plugin Components

Janus provides two re-usable plugin components, both in the `uri-factory/` directory:

* `plugin.js`: A stampit factory function that provides base functionality, extensible by composing with other (e.g. your own) plugins.
* `plugin-tester.js`: Functions for testing plugins. For examples, see `test/*plugin.js`, and the previously-mentioned [example plugins](#example-plugins).

#### Plugin API

See `uri-factory/plugin.js` for base and example implementations of these methods and properties.

##### uriFor([search] [,scope] [,field] [,format])

Returns an array where the first element is a string, which should contain any warnings associated with missing search expressions or invalid scopes or fields,
and the second element is an ojbect with an `href()` method, which must return a string representation of the generated redirect URI. `uriFor()` must never throw.

The UMN Libraries plugins use urijs objects for the second element of the return array, but any object with an href method with the appropriate signature is OK.

This is the only method that the Janus URI factory will call on a plugin, so it is the only required method a plugin must implement.

##### baseUri()

Returns an object that other plugin methods can modify to generate redirect URIs. Optional but useful.

##### emptySearchUri()

Because [uriFor()](#uriforsearch-scope-field-format) must never throw, it can be helpful to define in one place what URI to use when the user supplies no search expression.
Often this URI will be the same as the base URI, so the provided implementation just returns [baseUri()](#baseuri). Optional.

##### fields()

Maps Janus field parameters to their analagous parameters in the target search engine. Optional. Because many search engines use the same parameter names, the provided
implementation returns:

```javascript
{
  author: 'author',
  title: 'title',
  subject: 'subject',
}
```

##### scopes()

Returns an array or object that defines valid scopes for the target search engine. Because many search engines do not support scopes, the provided implementation returns
an empty object. Optional.

##### formats()

Returns an array or object the defines valid formats or material types for the target search engine. Because many search engines do not support formats, the provided
implementation returns an empty object. Optional.

##### emptySearchWarning

This property provides a string warning for a missing search expression. The provided default is 'Missing or empty search expression.' Optional.

##### badScopeWarning

This property provides a warning for an invalid scope. The provided default is 'Unrecognized scope: '. Optional.

##### badFieldWarning

This property provides a warning for an invalid field. The provided default is 'Unrecognized field: '. Optional.

##### badFormatWarning

This property provides a warning for an invalid format. The provided default is 'Unrecognized format: '. Optional.

### Sessions

Janus uses [koa-session](https://www.npmjs.com/package/koa-session) to assign each unique visitor a session ID, which it logs by default (see [Logging](#logging) below).
The session IDs are RFC4122 version 1 UUIDs. To customize session ID creation, override the `sessionId()` method. It accepts one parameter, `ctx`, a Koa context object.
It returns a promise, in case you want to generate IDs via some async process.

One way to override this method when invoking Janus:

```javascript 
const plugins = require('your-plugins');
const janus = require('@nihiliad/janus').methods({
  sessionId (ctx) {
    return new Promise(function (resolve, reject) {
      resolve(
        // generate your session id
      );
    });
  },  
});
const app = janus({
  uriFactoryPlugins: plugins,
});
app.listen(3000);
```

As described in [Application Factory](#application-factory) above, you can also define custom options for koa-session. See `index.js` for the default options.

### Logging

Janus uses [Bunyan](https://www.npmjs.com/package/bunyan) for logging. If provided, Janus will pass the values of the `redirectLog` and `errorLog` properties to the
[bunyan.createLogger()](https://www.npmjs.com/package/bunyan#constructor-api) constructor. If not provided, these values default to `{name: 'redirect'}` and `{name: 'error'}`,
which will cause Bunyan to log to `stdout` and `stderr`, respectively. For more control, override the Janus `redirectLogger()` and/or `errorLogger()` methods, which
create the Bunyan loggers.

#### redirectLogEvent(ctx)

One of the most valuable features of Janus is logging metadata about each request. To control what metadata Janus logs, override the `redirectLogEvent()` method. It accepts
two parameters, `ctx`, a Koa context object, and a `defaultEvent`, which you can modify to more easily customize what gets logged. It returns an object that Bunyan will include 
in a redirect log message for the request. See `defaultRedirectLogEvent()` in `index.js` for the structure of the `defaultEvent`.

One way to override this method when invoking Janus:

```javascript
const plugins = require('your-plugins');
const janus = require('@nihiliad/janus').methods({
  redirectLogEvent (ctx, defaultEvent) {
    return {
      // your custom object
    };
  },
});
const app = janus({
  uriFactoryPlugins: plugins,
});
app.listen(3000);
```

## Install

Install with npm. In package.json:

```json
  "dependencies": {
    "@nihiliad/janus": "^0.0.0"
  }
```

## Test

To run the linter and all unit tests:

```
npm test
```

### Lint

We use [standardjs](https://standardjs.com/) for linting. To lint all files:

```
npx standard
```

To automatically fix any errors that can be fixed automatically:

```
npx standard --fix
```

To lint a single file, e.g., `index.js`:

```
npx standard index.js
```

### Integration Tests

Some unit tests make HTTP requests to real web services. To run those tests, set the `RUN_INTEGRATION_TESTS` environment variable to a true value. The default value is false. This works for `npm test` and all commands described below.

### Unit Tests

We use [tape](https://github.com/substack/tape) for unit tests. To run all unit tests:

```
npx tape test/*.js
```

To run a single unit test file, e.g., `test/factory.js`:

```
npx tape test/factory.js
```

