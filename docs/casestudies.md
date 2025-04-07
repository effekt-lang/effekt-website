---
layout: docs
title: Casestudies
permalink: docs/casestudies
---

# Casestudies

This folder contains several case studies showcasing the Effekt language and how to use effects and handlers.

> You can find the [source code online at Github](https://github.com/effekt-lang/effekt/tree/master/examples/casestudies).

Some of the case studies build up on each other. For those, we recommend looking at them in the following order:

1. [Pull-based Lexer](/docs/casestudies/lexer.effekt.md): A lexer implementation using effects to express _requesting_ the next token
   of an input stream.
2. [Backtracking Parser](/docs/casestudies/parser.effekt.md): An implementation of an imperative parser combinator library, that uses the lexer.
3. [Pretty Printer](/docs/casestudies/prettyprinter.effekt.md): A pretty printer that uses nondeterminism to search for a layout filling a given width.
4. [ANF Transformation](/docs/casestudies/anf.effekt.md): An implementation of an ANF transformation using a `Bind` effect. Also composes all four case studies in one pipeline.

Other, independent case studies:

- [Automatic Differentiation](/docs/casestudies/ad.effekt.md): Using effect handlers to implement backpropagation.
- [Naturalistic DSLs](/docs/casestudies/naturalisticdsls.effekt.md): Using effect handlers to model linguistic effects and express natural language examples.
