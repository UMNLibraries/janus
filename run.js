'use strict';
import janus from './index.js';
import pubmedPlugin from './test/fixtures/pubmed-plugin.js';
const app = janus({
  uriFactoryPlugins: {pubmed: pubmedPlugin},
  uriPathPrefix: '/',
  errorLog: {
    name: 'error',
    streams: [{
      level: 'info',
      path: 'errorLog.txt'
    }]
  },
  redirectLog: {
    name: 'redirect',
    streams: [{
      level: 'info',
      path: 'redirectLogFile.txt'
    }]
  },
});
app.listen(3000);
