import * as monaco from "monaco-editor";

import ILanguage = monaco.languages.IMonarchLanguage;
import ITheme = monaco.editor.IStandaloneThemeData;

export const syntax = <ILanguage>{
  // defaultToken: 'invalid',

  keywords: [
    'module', 'import', 'def', 'val', 'var', 'effect', 'type', 'match',
    'case', 'record', 'extern', 'include', 'resume', 'with', 'if', 'try',
    'else', 'do', 'handle', 'while', 'fun', 'region', 'in', 'new'
  ],

  definitionKeywords: [
    'def', 'type', 'effect'
  ],

  literals: ['true', 'false'],

  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>='
  ],

  // we include these common regular expressions
  symbols:  /[=><!~?:&|+\-*\/\^%]+/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [/[a-z_$][\w$]*/, {
        cases: {
          '@keywords': {
            cases: {
              '@definitionKeywords': { token: 'keyword', next: '@definition' },
              '@default': 'keyword'
            }
          },
          '@literals': 'literal',
          '@default': 'identifier'
        }
      }],

      [/[A-Z][\w\$]*/, 'type.identifier' ],

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, { cases: { '@operators': 'operator',
                              '@default'  : '' } } ],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],

      // characters
      [/'[^\\']'/, 'string'],
      [/'/, 'string.invalid']
    ],

    definition: [
      { include: '@whitespace' },
      [/[a-zA-Z_$][\w$]*/, 'definition'],
      [new RegExp(""),'','@pop']
    ],

    comment: [
      [/[^\/*]+/, 'comment' ]
    ],

    string: [
      [/[^\\"]+/,  'string'],
      [/\\./,      'string.escape.invalid'],
      [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/,       'comment', '@comment' ],
      [/\/\/.*$/,    'comment'],
    ],
  },
};

export const docsTheme = <ITheme>{
  base: 'vs',
  inherit: false,
  colors: {
    "editor.background": "#f8f8f7"
  },
  rules: [
    { token: '', foreground: '333333', background: 'f8f8f7' },
    { token: 'keyword', foreground: '333333', fontStyle: 'bold' },
    { token: 'identifier', foreground: '333333' },
    { token: 'type.identifier', foreground: 'd73a49' },
    { token: 'definition', foreground: '735080' },
    { token: 'custom-info', foreground: '808080' },
    { token: 'string', foreground: '25995f' },
    { token: 'number', foreground: '005cc5' },
    { token: 'comment', foreground: '969896' },
    { token: 'literal', foreground: '0086b3' }
  ]
};


export const pageTheme = <ITheme>{
  base: 'vs',
  inherit: false,
  colors: {
    "editor.background": "#ffffff"
  },
  rules: [
    { token: '', foreground: '333333', background: 'f8f8f7' },
    { token: 'keyword', foreground: '333333', fontStyle: 'bold' },
    { token: 'identifier', foreground: '333333' },
    { token: 'type.identifier', foreground: 'd73a49' },
    { token: 'definition', foreground: '735080' },
    { token: 'custom-info', foreground: '808080' },
    { token: 'string', foreground: '25995f' },
    { token: 'number', foreground: '005cc5' },
    { token: 'comment', foreground: '969896' },
    { token: 'literal', foreground: '0086b3' }
  ]
};
