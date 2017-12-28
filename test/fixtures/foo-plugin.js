'use strict';
const stampit = require('stampit');
const URI = require('urijs');
const plugin = require('../../uri-factory/plugin');

const foo = stampit()
.methods({
  scopes () {
    return {
      business: 'Business Library',
      math: 'Math Library',
      music: 'Music Library',
    };
  },
  formats () {
    return {
      book: 'Books',
      article: 'Journal Articles',
      audio: 'Audio recordings',
      video: 'Video recordings',
    };
  },
  baseUri () {
    return URI({
      protocol: 'https',
      hostname: 'foo.com',
    });
  },
});

module.exports = plugin.compose(foo);
