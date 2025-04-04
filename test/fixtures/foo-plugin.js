'use strict'
import stampit from 'stampit';
import URI from 'urijs';
import plugin from '../../uri-factory/plugin.js';

const foo = stampit()
  .methods({
    scopes () {
      return {
        business: 'Business Library',
        math: 'Math Library',
        music: 'Music Library'
      }
    },
    formats () {
      return {
        book: 'Books',
        article: 'Journal Articles',
        audio: 'Audio recordings',
        video: 'Video recordings'
      }
    },
    baseUri () {
      return URI({
        protocol: 'https',
        hostname: 'foo.com'
      })
    }
  })

export default plugin.compose(foo);
