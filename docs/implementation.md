---
layout: docs
title: Implementation
permalink: docs/implementation
---

# The Effekt Compiler

The compiler pipeline for Effekt can be illustrated as follows:

<figure>
<img src="/docs/implementation/effekt-pipeline-img/image.svg" alt="Effekt Compiler Pipeline (07.09.22)" width="100%" />
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
  - [Transformation to capability-passing style](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/cps/Transformer.scala)

#### Middleend
Subsequently the Source IR is translated step-by-step to different IRs.

- The first translation is to an IR in fine-grain call-by-value, called Core, which corresponds
  to `System Xi` in [this paper](https://se.cs.uni-tuebingen.de/publications/brachthaeuser20effects/)
  and `System C` in [this paper](https://se.cs.uni-tuebingen.de/publications/brachthaeuser22effects/).
- On [Core](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/core/Tree.scala) there is an optimization pass carried out.
- For some backends (like LLVM) we translate Core to a more lowlevel IR called [Machine](https://github.com/effekt-lang/effekt/blob/main/effekt/shared/src/main/scala/effekt/machine/Tree.scala).

#### Backend
The final step is the translation to the corresponding backend language.
The different backends are targeted from different IRs.

  - From Core there are translations to JavaScript and Chez Scheme.
  - From Machine there are two translations, one targets LLVM, the other one will
    enable a JIT-compiler. Both of these are still work in progress.
