---
layout: docs
title: Casestudies
permalink: docs/casestudies
origin: effekt-website/blob/master/docs
---

# Case Studies

This folder contains several case studies showcasing the Effekt language and how to use effects and handlers.

> You can find the [source code online at Github](https://github.com/effekt-lang/effekt/tree/master/examples/casestudies).

Some of the case studies build up on each other. For those, we recommend looking at them in the following order:

1. [Pull-based Lexer](/docs/casestudies/lexer): A lexer implementation using effects to express _requesting_ the next token
   of an input stream.
2. [Backtracking Parser](/docs/casestudies/parser): An implementation of an imperative parser combinator library, that uses the lexer.
3. [Pretty Printer](/docs/casestudies/prettyprinter): A pretty printer that uses nondeterminism to search for a layout filling a given width.
4. [ANF Transformation](/docs/casestudies/anf): An implementation of an ANF transformation using a `Bind` effect. Also composes all four case studies in one pipeline.

Other, independent case studies:

- [Automatic Differentiation](/docs/casestudies/ad): Using effect handlers to implement backpropagation.
- [Naturalistic DSLs](/docs/casestudies/naturalisticdsls): Using effect handlers to model linguistic effects and express natural language examples.
- [Probabilistic Inference](/docs/casestudies/inference): Performing inference over probabilistic models with the help of effects.
- [Scheduler](/docs/casestudies/scheduler): Cooperatively threaded scheduler using effect handlers.
- [Naturalistic DSLs](/docs/casestudies/buildsystem): Implementation of the ideas introduced by "Build Systems à la Carte" by Andrey Mokhov, Neil Mitchell and Simon Peyton Jones.