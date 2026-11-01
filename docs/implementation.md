---
layout: docs
title: Implementation
permalink: docs/implementation
---

# The Effekt Compiler

The compiler pipeline for Effekt can be illustrated as follows:

<figure>
<img src="/docs/implementation/effekt-pipeline-img/image.svg" alt="Effekt Compiler Pipeline (07.09.22)" width="100%" />
<figcaption>The figure shows the pipeline from September 2022. The text below describes the current pipeline.</figcaption>
</figure>

The compilation is divided into the following large phases: parsing, frontend,
middleend and backend. As can be seen, there are multiple backends. While the
steps in the frontend phase are shared for all backends, some of the steps in
the middleend are specific to some backends. Not all steps are fully implemented
yet, some of them are still work in progress.

The source code modeling the pipeline can be found in [Compiler.scala](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/Compiler.scala).

In the following we briefly describe the different phases.

#### Parsing
The first step is to parse the given Effekt program into an AST in the IR called [Source](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/source/Tree.scala).

#### Frontend
On Source there are several steps carried out, mainly
  - [Name Resolution](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/Namer.scala)
  - [Typechecking](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/Typer.scala)
  - [Translation to Capability-Passing Style](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/source/ExplicitCapabilities.scala)

#### Middleend
Subsequently the Source IR is translated step-by-step to different IRs.

- The first translation is to an IR in fine-grain call-by-value, called Core, which corresponds
  to `System Xi` in [this paper](https://se.cs.uni-tuebingen.de/publications/brachthaeuser20effects/)
  and `System C` in [this paper](https://se.cs.uni-tuebingen.de/publications/brachthaeuser22effects/).
- Then we do many optimization passes on [Core](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/core/Tree.scala) itself.
- For the JavaScript backends and the `chez-cps` backend, we translate Core to an IR in continuation-passing style, called [CPS](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/cps/Tree.scala).
- For the LLVM backend, we translate Core to a more lowlevel IR called [Machine](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/machine/Tree.scala).

#### Backend

The final step is the translation to the corresponding backend language.
The different backends are targeted from different IRs.

  - From Core there are translations to Chez Scheme (the backends `chez-callcc` and `chez-monadic`).
  - From CPS there are translations to JavaScript (the backends `js` and `js-web`) and to Chez Scheme (the backend `chez-cps`).
  - From Machine there is a translation to LLVM (the backend `llvm`).
