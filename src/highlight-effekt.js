/*
ORIGINAL
=========
https://github.com/highlightjs/highlight.js/blob/master/src/languages/scala.js
=========
Language: Scala
Category: functional
Author: Jan Berkel <jan.berkel@gmail.com>
Contributors: Erik Osheim <d_m@plastic-idolatry.com>
Website: https://www.scala-lang.org
*/
hljs.registerLanguage("effekt", function highlightEffekt(hljs) {
  var ANNOTATION = { className: 'meta', begin: '@[A-Za-z]+' };

  var SUBST = {
    className: 'subst',
    variants: [
      {begin: '\\$[A-Za-z0-9_?!]+'},
      {begin: '\\${', end: '}'}
    ]
  };

  var STRING = {
    className: 'string',
    variants: [
      {
        begin: '"', end: '"',
        illegal: '\\n',
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: '"""', end: '"""',
        relevance: 10
      },
      {
        begin: '[a-z]+"', end: '"',
        illegal: '\\n',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST]
      },
      {
        className: 'string',
        begin: '[a-z]+"""', end: '"""',
        contains: [SUBST],
        relevance: 10
      }
    ]
  };

  var SYMBOL = {
    className: 'symbol',
    begin: '\'\\w[\\w\\d_?!]*(?!\')'
  };

  var TYPE = {
    className: 'type',
    begin: '\\b[A-Z][A-Za-z0-9_?!]*',
    relevance: 0
  };

  var NAME = {
    className: 'title',
    begin: /[^0-9\n\t "'(),.`{}\[\]:;][^\n\t "'(),.`{}\[\]:;]+|[^0-9\n\t "'(),.`{}\[\]:;=]/,
    relevance: 0
  };

  var DEFINITION = {
    className: 'function',
    beginKeywords: 'def effect type val var extern fun interface resource namespace',
    end: /[:={\[(\n;]/,
    excludeEnd: true,
    contains: [NAME]
  };

  return {
    name: 'Effekt',
    keywords: {
      literal: 'true false',
      keyword: 'module effect type def with val var if for while import return else case try match resume do record region in new interface let box unbox fun extern and is namespace pure'
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      SYMBOL,
      TYPE,
      DEFINITION,
      hljs.C_NUMBER_MODE,
      ANNOTATION
    ]
  };
});

module.exports = hljs;
