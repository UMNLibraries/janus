'use strict'
const janus = require('./')
const pubmedPlugin = require('./test/fixtures/pubmed-plugin')
const app = janus({
  uriFactoryPlugins: {pubmed: pubmedPlugin},
})
app.listen(3000)
