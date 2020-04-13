---
layout: docs
title: Effect Safety
permalink: docs/concepts/effect-safety
---

# Effect Safety
Unlike Java (with runtime exceptions) or Scala, in Effekt effects are fully
tracked by the type system (that is, effect system). For instance using
`println` has an associated effect `Console`.

```effekt
def sayHello(): Unit / { Console } =
  println("Hello World!")
```
While the left component (that is, `Unit`) is the type of values returned by
`sayHello`, the right component of the return type (that is, `{ Console }`)
describes the _set_ of effects required by `sayHello`.

#### Effects are Requirements
As opposed to other effect systems, where effects communicate the _side effects_
a program has besides computing a result, the notion of effects in the Effekt
language is that of a **requirement**.

We thus read the signature of `sayHello` as

> "The function `sayhello` computes a value of type `Unit` requiring a
> capability for `Console` in its calling context."

That is, it can only be run in contexts that allow the `Console` effect.

For instance, we _cannot_ call it in a "pure" function:
```effekt
def pureFun(): Unit / {} = sayHello()
//                         ^^^^^^^^^^
//                 Unhandled effects { Console }
```
Here, we put "pure" in quotes since the difference in our notion of effects also
leads to a difference of purity compared to existing languages.

#### Higher-Order Functions and Relative Purity
Functions can take blocks as arguments. An example, we have seen in the
[introduction](../) is the function `map`:

```
def map[A, B](l: List[A]) { f: A => B } : List[B]
```
The type of the block argument `f` is `A => B` indicating that it consumes an
element of type `A` to produce a value of type `B`. Actually, `A => B` is
syntactic sugar for `(A) => B / {}`. That is, it is a block from `A` to `B`
not using any effects _visible to `map`_.

Maybe surprisingly, on the callsite to `map`, we actually can use other effects:
```
def printIncrement(l: List[Int]): List[Int] / { Console } =
  map(l) { x =>  println(x); x + 1 }
```
Here, the block passed to `map` _does_ use another effect, namely the `Console`
effect.
That is, only from the point of view of `map`, the block `f` is _pure_.

This shift in perspective, provides guarantees for the caller of `map`: the
implementation cannot observe (besides global side channeling) any effects
used by `f`.

This comes at the cost of some guarantees for the implementor of `map`:
Calling `f` can have side-effects observable to the user, losing referential
transparency to some extent. We cannot simply replace a call to `f` by its
results. Also, calling it twice is different from calling it once.

We will see this in detail when talking about [effect polymorphism](effect-polymorphism).
