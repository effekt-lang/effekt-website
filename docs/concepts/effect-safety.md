---
layout: docs
title: Effect Safety
permalink: docs/concepts/effect-safety
---

# Effect Safety
Similar to Java's checked exceptions, Effekt features an effect system that
allows us to track effects. As a very simple example, we can define our own
exceptions (even though they are defined in the [stdlib](https://github.com/effekt-lang/effekt/blob/master/libraries/common/exception.effekt)):
```effekt
effect exc(msg: String): Nothing

def div(n: Double, m: Double): Double / { exc } =
  if (m == 0.0) do exc("Division by zero") else n / m
```
While the left component of the return type (that is, `Double`) is the type of values returned by
`div`, its right component (that is, `{ exc }`)
describes the _set_ of effects that need to be handled by callers of `div`.

#### Effects are Requirements
As opposed to other effect systems, where effects communicate the _side effects_
a program has besides computing a result, the notion of effects in the Effekt
language is that of a **requirement**.

We thus read the signature of `sayHello` as

> "The function `div` computes a value of type `Double` requiring a
> capability for `exc` in its calling context."

That is, it can only be run in contexts that allow the `exc` effect operation.

For instance, we _cannot_ call it in a "pure" function:
```effekt
def pureFun(): Double / {} = div(42.0, 3.0)
//                           ^^^^^^^^^^^^^^
//         Effect Exc is not allowed in this context.
```
Here, we put "pure" in quotes since the difference in our notion of effects also
leads to a difference of purity compared to existing languages.
Here, `pureFun` simply imposes no requirements on its calling context. It would
thus be unsound to call `div`, since it requires `Exc`.

#### Higher-Order Functions and Relative Purity
Functions can take blocks as arguments. One example function that does so is
`each`:

```effekt:reset:hide
effect exc(msg: String): Nothing

def div(n: Double, m: Double): Double / { exc } =
  if (m == 0.0) do exc("Division by zero") else n / m
```

```effekt:sketch
def foreach[A](l: List[A]) { f: A => Unit }: Unit = <>
```
The type of the block argument `f` is `A => Unit` indicating that it consumes an
element of type `A`. Actually, `A => Unit` is
syntactic sugar for `(A) => Unit / {}`. That is, it is a block from `A` to `Unit`
not using any effects _visible to `each`_. The implementation of `each` is omitted,
we are using a hole (`<>`) that allows type-checking, but will result in a
runtime error, when forced.

Maybe surprisingly, at the callsite to `each`, we actually can use other effects:
```
def meanRatios(l: List[(Double, Double)]): Double / { exc } = {
  var sum = 0.0;
  var count = 0;

  l.foreach {
    case (x, y) =>
      sum = sum + div(x, y)
      //          ^^^^^^^^^
      // This could use the Exc effect!
      count = count + 1
  }

  div(sum, count.toDouble)
}
```
Here, the block passed to `foreach` _does_ use another effect, namely the `exc`
effect operation. In fact, Effekt encourages a different reading of signatures of effectful
functions, similar to "contracts":


```effekt:sketch
//                                  "provided" effects
//                                          vv
def foreach[A](l: List[A]) { f: A => Unit / {} }: Unit / {}
//                                                       ^^
//                                               "required" effects
```
That is, effects in return position are "required" (the calling context needs to provide them),
and effects in argument positions are "provided" (the function passed in the calling context can use them).

This shift in perspective offers guarantees for the caller of `foreach`: the
implementation cannot observe (besides global side channeling) any effects
used by `f`.

This comes at the cost of some guarantees for the implementor of `foreach`:
Calling `f` might have side-effects observable to the user, losing referential
transparency to some extent. We cannot simply replace a call to `f` by its
results. Also, calling it twice is different from calling it once.
Even though `f` is annotated with the empty effect set, it thus cannot be
assumed to be "pure".

We will see this in detail when talking about [effect polymorphism](effect-polymorphism).

We can run the example (we'll cover handling in the next section) in the following way:
```effekt:repl
try { meanRatios([(4.2, 1.3)]) } with exc { msg => 0.0 }
```
