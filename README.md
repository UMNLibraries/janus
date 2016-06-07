# janus

[![Build Status](https://secure.travis-ci.org/UMNLibraries/janus.png)](http://travis-ci.org/UMNLibraries/janus)

Common handler for all library website searches.


## Install

Install with npm. In package.json:

```json
  "dependencies": {
    "janus": "UMNLibraries/janus"
  }
```

## Use

```javascript
const janus = require('janus');
const plugins = require('janus-uri-factory-plugins');
const app = janus({
  uriFactoryPlugins: plugins,
});
```

## Test

Run all unit tests:

```
npm test
```

Run a single unit test by invoking [tape](https://github.com/substack/tape) directly:

```
./node_modules/.bin/tape test/factory.js
```

## Lint

Lint all files:

```
npm run lint
```

Lint a single file by invoking [ESLint](http://eslint.org/) directly:

```
./node_modules/.bin/eslint index.js
```

