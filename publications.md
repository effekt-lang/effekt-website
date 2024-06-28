---
layout: page
title:  "Research Papers"
section: "publications"
position: 5
---

## Research Papers

The Effekt language is developed by members of the [effects research team at the
University of Tübingen](https://se.cs.uni-tuebingen.de). For a detailed overview
of our papers, please visit:

> <https://se.cs.uni-tuebingen.de/publications>

### Language Design
Regarding the language design, there are two main references:

> **"Effects as Capabilities: Effect Handlers and Lightweight Effect Polymorphisms"**.\
> Jonathan Immanuel Brachthäuser, Philipp Schuster, and Klaus Ostermann. 2020.\
> In _Proc. ACM Program. Lang._, 4 (OOPSLA), Article 126 ([ACM](https://dl.acm.org/doi/10.1145/3428194), [Extended Techreport](https://se.cs.uni-tuebingen.de/publications/brachthaeuser20effekt/)).


> **"Effects, Capabilities, and Boxes: from scope-based reasoning to type-based reasoning and back"**.\
> Jonathan Immanuel Brachthäuser, Philipp Schuster, Edward Lee, and Aleksander Boruch-Gruszecki.\
> In _Proc. ACM Program. Lang._, 6 (OOPSLA), Article 76 ([ACM](https://dl.acm.org/doi/abs/10.1145/3527320), [Extended Techreport](https://se.cs.uni-tuebingen.de/publications/brachthaeuser22effects/))


### Compilation of Effect Handlers

> **"From Capabilities to Regions: Enabling Efficient Compilation of Lexical Effect Handlers"**.\
> Marius Müller, Philipp Schuster, Jonathan Lindegaard Starup, Klaus Ostermann, and [Jonathan Immanuel Brachthäuser]{.sf}. 2023.
> In _Proc. ACM Program. Lang._, 7 (OOPSLA2), Article 225. ([Techreport](https://se.cs.uni-tuebingen.de/publications/mueller23lift/), [ACM](http://dx.doi.org/10.1145/3622831))

> **"A Typed Continuation-Passing Translation for Lexical Effect Handlers"**.\
> Philipp Schuster, Jonathan Immanuel Brachthäuser, Marius Müller, and Klaus Ostermann.\
> In _Proceedings of the International Conference on Programming Language Design and Implementation (PLDI) 2022_. ([Techreport](https://se.cs.uni-tuebingen.de/publications/schuster22typed/), [ACM](https://dl.acm.org/doi/abs/10.1145/3519939.3523710))

> **"Region-based Resource Management and Lexical Exception Handlers in Continuation-Passing Style"**.\
> Philipp Schuster, Jonathan Immanuel Brachthäuser, and Klaus Ostermann.\
> In _Proceedings of the European Symposium on Programming (ESOP 2022)_. ([Techreport](https://se.cs.uni-tuebingen.de/publications/schuster22region/), [Springer](https://link.springer.com/chapter/10.1007/978-3-030-99336-8_18))

> **"Capability-Passing Style for Zero-Cost Effect Handlers"**.\
> Philipp Schuster, Jonathan Immanuel Brachthäuser, and Klaus Ostermann.\
> In _Proceedings of the International Conference on Functional Programming (ICFP 2020)_. ([Techreport](http://se.cs.uni-tuebingen.de/publications/schuster19zero/), [ACM](https://dl.acm.org/doi/10.1145/3408975))


### Other Related Work
The language is the result of several developments. In particular, it is the
first language to combine a second-class type-system with advanced control effects.
In particular, we compile Effekt programs to capability-passing style, using
a monadic implementation of delimited control.

You can read more about the language, its predecessors, and important
technical details in the following papers, which are ordered by relevance
to the Effekt language. We are happy to share author-copies on request.

> **"Effekt: Capability-Passing for Type- and Effect-Safe, Extensible Effect Handlers in Scala"**.\
> Jonathan Immanuel Brachthäuser, Philipp Schuster, and Klaus Ostermann.\
> _Journal of Functional Programming (JFP 2020)_. ([PDF](http://se.cs.uni-tuebingen.de/publications/brachthaeuser19effekt/))

> **"Effekt: Extensible Algebraic Effects in Scala (Short Paper)"**.
> Jonathan Immanuel Brachthäuser and Philipp Schuster.\
> In _Proceedings of the 8th ACM SIGPLAN International Symposium on Scala_ (SCALA 2017).\
> ACM, New York, NY, USA, 67-72. ([PDF](http://se.cs.uni-tuebingen.de/publications/brachthaeuser17effekt/))

> **"Effect Handlers for the Masses"**.\
> Jonathan Immanuel Brachthäuser, Philipp Schuster, and Klaus Ostermann.\
> In _Proc. ACM Program. Lang._, 2 (OOPSLA 2018): 111:1--111:27. ([PDF](http://se.cs.uni-tuebingen.de/publications/brachthaeuser18effect/))

> **"Programming with Implicit Values, Functions, and Control"**.\
> Jonathan Immanuel Brachthäuser and Daan Leijen.\
> _Technical Report MSR-TR-2019-7_.
> Microsoft Research. ([PDF](https://www.microsoft.com/en-us/research/publication/programming-with-implicit-values-functions-and-control-or-implicit-functions-dynamic-binding-with-lexical-scoping/))


> **"Typing, Representing, and Abstracting Control"**.\
> Philipp Schuster and Jonathan Immanuel Brachthäuser.\
> In _Proceedings of the 3rd ACM SIGPLAN International Workshop on Type-Driven Development_ (TyDe 2018).\
> ACM, New York, NY, USA, 14-24. ([PDF](http://se.cs.uni-tuebingen.de/publications/schuster18typing/))

> **"Effect Handlers, Evidently"**.\
> Ningning Xie, Jonathan Immanuel Brachthäuser, Daniel Hillerström, Philipp Schuster, Daan Leijen. 2020.\
>  In _Proceedings of the International Conference on Functional Programming (2020)_. ([PDF](http://se.cs.uni-tuebingen.de/publications/xie20evidently/), [ACM](https://dl.acm.org/doi/10.1145/3408981))

> **"Taming Control-flow through Linear Effect Handlers"**.\
> Daan Leijen and Jonathan Immanuel Brachthäuser.\
> Accepted for presentation at _the 7th ACM SIGPLAN Workshop on Higher-Order Programming with Effects (HOPE 2018)_.

> **"Towards Naturalistic EDSLs using Algebraic Effects"**.\
> Jonathan Immanuel Brachthäuser.\
> Accepted for presentation at _Domain-Specific Language Design and Implementation (DSLDI 2017)_.
