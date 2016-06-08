# Janus

[![Build Status](https://secure.travis-ci.org/UMNLibraries/janus.png)](http://travis-ci.org/UMNLibraries/janus)

Common handler for all library website searches. Configurable, extensible, re-usable.

Many library websites have multiple search forms that redirect users to various search engines.
Janus is a common target application for all those searches, allowing for data collection and
other handling of the searches with a single code base.

Janus uses a simple URI API for all search engines, which also makes search forms easier to
write and maintain. For example, at UMN Libraries, Janus transforms this request...

https://stacks.lib.umn.edu/janus?target=mncatdiscovery&search=darwin

...into this MNCAT Discovery (Primo, our library catalog) request:

http://primo.lib.umn.edu/primo_library/libweb/action/dlSearch.do?institution=TWINCITIES&vid=TWINCITIES&indx=1&dym=true&highlight=true&lang=eng&search_scope=mncat_discovery&query=any%2Ccontains%2Cdarwin

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

To configure and extend Janus for use in your library, see the [API](#api) section below.

## API

### URI API

Janus accepts only GET requests, and recognizes these parameters:

* `target`
* `search`
* `scope`
* `field`

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

### Application Factory

Janus is a [stampit](https://github.com/stampit-org/stampit) factory function that creates a [Koa v2.x](https://github.com/koajs/koa/tree/v2.x) application.
An understanding of those technologies may help, but should not be necessary, to understand the following API sections. More advanced use of Janus will
likely require that understanding.

Most Janus configuration involves passing a properties object to the factory function:

```javascript
const app = janus({
  uriFactoryPlugins: {
    target1: target1Plugin,
    target2: target2Plugin,
  },
  redirectLog: {
    // options for bunyan.createLogger()
  },
  errorLog: {
    // options for bunyan.createLogger()
  },
  favicon: '/path/to/favicon.ico',
});
```

More about these properties in the sections below.

### URI Factory Plugins

Janus generates redirect URIs with a factory. The most obvious and powerful way to extend Janus is to create plugins for this factory, one for each
search engine you want to target. 

For simple examples, see the `test/fixtures/*plugin.js` files in this repo. For more complex examples, see the 
[UMN Libraries plugins](https://github.com/UMNLibraries/janus-uri-factory-plugins).



## Use

```javascript
const janus = require('janus');
const plugins = require('janus-uri-factory-plugins');
const app = janus({
  uriFactoryPlugins: plugins,
});
```

## Install

Install with npm. In package.json:

```json
  "dependencies": {
    "janus": "UMNLibraries/janus"
  }
```

## Test

Run all unit tests:

```
npm test
```

Run a single unit test by invoking [tape](https://github.com/substack/tape) directly:

```
node_modules/.bin/tape test/factory.js
```

## Lint

Lint all files:

```
npm run lint
```

Lint a single file by invoking [ESLint](http://eslint.org/) directly:

```
node_modules/.bin/eslint index.js
```
