---
layout: docs
title: Language Evolution
permalink: evolution
---

# A Brief History of Effekt for Fellow Researchers
Are you a researcher, read one of our [papers](./publications), and noticed that
the syntax (or something else) of the language changed?
Maybe you want to benchmark against Effekt?

Here, we briefly describe the evolution of the language by summarizing the differences to the papers and the most important changes.
This should hopefully help you get started. Otherwise, feel free to [reach out to us](https://se.cs.uni-tuebingen.de/team/brachthaeuser/).

## 2023 Paper: From Capabilities to Regions

> **"From Capabilities to Regions: Enabling Efficient Compilation of Lexical Effect Handlers"**.\
> Marius Müller, Philipp Schuster, Jonathan Lindegaard Starup, Klaus Ostermann, and Jonathan Immanuel Brachthäuser. 2023.
> In _Proc. ACM Program. Lang._, 7 (OOPSLA2), Article 225. ([Techreport](https://se.cs.uni-tuebingen.de/publications/mueller23lift/), [ACM](https://doi.org/10.1145/3622831))

In this paper, we complete the [lift-inference pipeline](https://effekt-lang.org/docs/implementation/lift-inference) from core (back then System Xi),
via lifted, to regions, to iterated CPS.

We implemented evidence monomorphization, which means that handlers are specialized to the stack shape they are used in.

The whole program optimizing compiler of MLton did the rest and allowed us to generate very fast binaries.

#### Since then
- we dropped the whole pipeline as well as the MLton backend. While it led to programs in System F that were easy to optimize by MLton, there also were some downsides: the pipeline was quite involved (we published three papers about it), System F requires higher-rank polymorphism which is not supported by MLton, we only supported System Xi, but not System C (first-class functions were missing in their full generality). This means if you want to compare against this approach, you need to use Effekt version 0.3.0 or older. The LLVM backend is a substitute for the MLton backend, but at the point of writing still significantly slower.

## 2022 Paper: Effects, Capabilities, Boxes

> **"Effects, Capabilities, and Boxes: from scope-based reasoning to type-based reasoning and back"**.\
> Jonathan Immanuel Brachthäuser, Philipp Schuster, Edward Lee, and Aleksander Boruch-Gruszecki.\
> In _Proc. ACM Program. Lang._, 6 (OOPSLA), Article 76 ([ACM](https://doi.org/10.1145/3527320), [Extended Techreport](https://se.cs.uni-tuebingen.de/publications/brachthaeuser22effects/))

The paper shows how to smoothly migrate between scope-based reasoning (things that are in scope can be used) and type-based reasoning (the type says I can use this, so I can).
This paper enabled us to add first-class functions back to the Effekt language.

#### Since then
- The syntax of System C is slightly changed in the source language Effekt
- System C as presented in the paper doesn't have effects or effect inference. This is implemented in the Effekt source language.
- Before this paper, we talked about "user-defined effects" and "builtin effects", where only the first category can be handled by effect handlers. After this paper, we understood that there are no builtin effects, but that these are captures / resources that are closed over and thus never can be changed. Consequently, the `Console` effect was removed and replaced by the builtin `io` capability for `println`.

## 2020 Paper: Effects as Capabilities paper

> **"Effects as Capabilities: Effect Handlers and Lightweight Effect Polymorphisms"**.\
> Jonathan Immanuel Brachthäuser, Philipp Schuster, and Klaus Ostermann. 2020.\
> In _Proc. ACM Program. Lang._, 4 (OOPSLA), Article 126 ([ACM](https://doi.org/10.1145/3428194), [Extended Techreport](https://se.cs.uni-tuebingen.de/publications/brachthaeuser20effekt/)).

The paper presents the foundations of the Effekt language. It introduces lexical effect handlers, lightweight effect polymorphism, syntactically differentiated blocks (which we now call "computation") from values, and introduced a capability-passing translation as an implementation strategy.

#### Since then
- we now have first-class functions
- we write effect operations lower-case
- we use `interface` for multiple operations and `effect` for singleton operations
- type parameters of singleton operations now are universally quantified, not existentially

## Older Papers
We had some [papers](./publications#other-related-work) describing the Scala Effekt (Scala Symposium 2017, JFP 2020) and Java Effekt (OOPSLA 2018) libraries. These libraries implemented _lexical_ effect handlers.

#### Since then
- Besides implementing lexical effect handlers, the libraries have little to do with the current standalone Effekt language
- A translation of the monadic implementation of the Scala libraries is still the operational foundation of the JavaScript backend of Effekt and can be found in [`libraries/js/effekt_runtime.js`](https://github.com/effekt-lang/effekt/blob/master/libraries/js/effekt_runtime.js).
