---
layout: page
title: Try Effekt Online
section: "quickstart"
position: 2
---

# Try Effekt Online
You can immediately experiment with the Effekt language, without [installing](docs/getting-started) it.

Compared to other languages with effect handlers (and support for polymorphic effects)
the Effekt language aims to be more lightweight in its concepts.

```effekt:prelude:hide
import immutable/list
import immutable/option
import text/string
```

### Online Editor
Below you can find an online editor, which is enabled by clicking "edit" on the right. Please be aware that
the changes are not saved!
```
// No First-Class Functions
// ========================
// We purposefully leave out one otherwise very prominent feature:
// there are no **first-class functions**!

// Instead, we treat _all_ functions as _second-class_.
// While functions which (following Ruby jargon) we call _blocks_ can take other
// blocks as arguments, they always have to be fully applied.

// The following example shows the standard map function on lists:
def myMap[A, B](l: List[A]) { f: A => B } : List[B] =
  l match {
    case Nil() => Nil()
    case Cons(a, rest) => Cons(f(a), myMap(rest) { a => f(a) })
  }

// Map takes a value argument `l` and a block argument `f` enclosed in curly braces.
// In the case for `Cons` we call `map` on the rest of the list, passing `f`. Note,
// how we require `f` to be fully applied. That is, we need to pass a block
// that applies `f` (eta-expansion).

// The requirement that blocks always have to be (fully) applied and that we do not
// have first-class functions has the following implications:
// - blocks cannot be returned or stored in variables (they are no values)
// - blocks cannot escape their definition site
// - blocks do not need to be represented by closures -- all values used in blocks are still available on the call-stack

// For instance, try to comment out any of the below usages of `someBlock`:

def noFirstClass { someBlock: () => Int / {} } = {
  // val b = someBlock
  // Cons(someBlock, Nil())
  ()
  // someBlock
}

// Blocks can neither be assigned to variables, passed to constructors, or returned from functions.
//
// Maybe most importantly, effect checking becomes much easier, while still
// supporting many advanced use cases.


// Static Effect Checking
// ======================
// Unlike Java (with runtime exceptions) or Scala, in Effekt all effects are fully
// tracked by the type system (that is, effect system). For instance using
// `println` has an associated effect `Console`.

def sayHello(): Unit / { Console } =
  println("Hello World!")

// While the left component (that is, `Unit`) is the type of values returned by
// `sayHello`, the right component of the return type (that is, `{ Console }`)
// describes the _set_ of effects required by `sayHello`. That is, it can
// only be run in contexts that allow the `Console` effect.
//
// For instance, we cannot call it in a top-level function that requires no effects:
def pureFun(): Unit / {} = <{ sayHello() }>
//                            ^^^^^^^^^^
//                 Unhandled effects { Console }

// > Remark: The above syntax `<{ ... }>` denotes _hole-blocks_. You can hover over
// > the hole to see the expected and inferred types and effects. You can remove
// > the hole to observe the annotated type error.
// >
// > You can always wrap hole-blocks around arbitrary expressions to inspect the
// > inspected and inferred types and effects.

// Effect Types
// ------------
// While the left component (that is, `Unit`) is the type of values returned by
// `sayHello`, the right component of the return type (that is, `{ Console }`)
// describes the _set_ of effects required by `sayHello`.

// Type Annotations on Function Definitions
// ----------------------------------------
// Like other languages, we require that the parameter types on functions are
// fully annotated. Return types (for non-recursive functions) can be inferred,
// though. This way, we force the author of a higher-order function definition to
// be explicit about the effects of the block arguments.

// For instance, in the expanded type signature of `map`
def myMap2[A, B](l: List[A]) { f: A => B / {} } : List[B] = <>

// > Remark: The syntax `<>` is short for the hole-block `<{ () }>` containing the unit value.

// The type of the block argument `f` is `A => B / {}` indicating that it consumes an
// element of type `A` to produce a value of type `B`. The syntax `A => B` is
// sugar for `(A) => B / {}`. That is, it is a block from `A` to `B`
// not using any effects _visible to `map`_.

// Maybe surprisingly, on the callsite to `map`, we actually can use other effects:
def printIncrement(l: List[Int]): List[Int] / { Console } =
  myMap(l) { x =>  println(x); x + 1 }

// Here, the block passed to `map` _does_ use another effect, namely the `Console` effect.
// That is, only from the point of view of `map`, the block `f` is _pure_.

// This shift in perspective, provides guarantees for the caller of `map`: the
// implementation cannot observe (besides global side channeling) any effects
// used by `f`.

// This comes at the cost of some guarantees for the implementor of `map`:
// Calling `f` can have side-effects observable to the user, losing referential
// transparency to some extent. We cannot simply replace a call to `f` by its
// results. Also, calling it twice is different from calling it once.

// Effects are Requirements
// ------------------------
// As opposed to other effect systems, where effects communicate the _side effects_
// a program has besides computing a result, the notion of effects in the Effekt
// language is that of a **requirement**.

// We thus read the signature of `sayHello` as
//
// > "The function `sayhello` computes a value of type `Unit` requiring a
// > capability for `Console` in its calling context."
//
// That is, it can only be run in contexts that allow the `Console` effect.

// Functions and Function Calls
// ============================
// Effekt supports multiple argument sections. For instance, we can define the
// function:
def manyArguments(n: Int, m: String) { b1: () => Unit } (otherValue: Boolean) { b2: String }: Unit = <>

// Block argument sections (in curly braces) can only take a single block. The syntax `b2: String` is short
// for `b2: () => String / {}`.

// Effekt also supports syntactic sugar to invoke functions, where the first argument section takes a
// single value argument:
def sugar() = [1, 2, 3].printIncrement
def desugared() = printIncrement([1, 2, 3])

// All other argument sections follow as usual. For instance, we can call map like:
def mapped() = [1, 2, 3].map { x => x + 1 }
def mappedDesugared() = map([1, 2, 3]) { x => x + 1 }
```

### REPL
The following read-eval-print-loop gives you access to run the above contents:
```effekt:repl
printIncrement([1, 2, 3])
```