# Janus

[![Build Status](https://secure.travis-ci.org/UMNLibraries/janus.png)](http://travis-ci.org/UMNLibraries/janus)

Common handler for all library website searches. Configurable, extensible, re-usable.

Many library websites have multiple search forms that redirect users to various search engines.
Janus is a common target application for all those searches, allowing for data collection and 
other handling of the searches with a single code base.

Janus uses a simple URL API for all search engines, which also makes search forms easier to
write and maintain. For example, at UMN Libraries, Janus transforms this request...

https://stacks.lib.umn.edu/janus?target=mncatdiscovery&search=darwin

...into this MNCAT Discovery (Primo, our library catalog) request:

http://primo.lib.umn.edu/primo_library/libweb/action/dlSearch.do?institution=TWINCITIES&vid=TWINCITIES&indx=1&dym=true&highlight=true&lang=eng&search_scope=mncat_discovery&query=any%2Ccontains%2Cdarwin


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

