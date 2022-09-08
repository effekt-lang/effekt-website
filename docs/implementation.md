---
layout: docs
title: Implementation
permalink: docs/implementation
---

# The Effekt Compiler

The compiler pipeline for Effekt can be illustrated as follows

<img src="effekt-pipeline-img/image.svg" alt="Effekt Compiler Pipeline (07.09.22)" width=1200/>

The compilation is divided into the following large phases: parsing, frontend,
middleend and backend. As can be seen, there are multiple backends. While the
steps in the frontend phase are shared for all backends, some of the steps in
the middleend are specific to some backends. Not all steps are fully implemented
yet, some of them are still work in progress.

In the following we briefly describe the different phases.

- Parsing: The first step is to parse the given Effekt program into an AST in the
  IR called Source.
- Frontend: On Source there are several steps carried out, mainly
  - Name Resolution
  - Typechecking
  - Transformation to capability-passing style
- Middleend: Subsequently the Source IR is translated step-by-step to different IRs.
  - The first translation is to a fine-grain call-by-value IR called Core, which corresponds
    to `System Xi` in [this paper](https://se.cs.uni-tuebingen.de/publications/brachthaeuser20effects/)
    and `System C` in [this paper](https://se.cs.uni-tuebingen.de/publications/brachthaeuser22effects/).
  - On Core there is an optimization pass carried out.
  - Afterwards Core is translated to an IR called Lifted by inferring lifting
    information as described [here](lift-inference). This is finished
    for a large subset of Core, but still work in progress for first-class functions.
  - From Lifted there is a translation to a more lowlevel IR called Machine, which
    is still work in progress.
- Backend: The final step is the translation to the corresponding backend language.
  The different backends are targeted from different IRs.
  - From Core there are translations to JavaScript and Chez Scheme.
  - From Lifted there is a translation to Chez Scheme, too.
  - From Machine there are two translations, one targets LLVM, the other one will
    enable a JIT-compiler. Both of these are still work in progress.
