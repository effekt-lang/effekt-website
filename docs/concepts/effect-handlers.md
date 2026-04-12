---
layout: docs
title: Effect Handlers
permalink: docs/concepts/effect-handlers
---

# An Introduction to (Algebraic) Effect Handlers
Besides the built-in functions like `println` that have effects (e.g. `Console`),
which are tracked by the effect system, Effekt also offers _user definable control effects_.

This is fancy word for saying we can express advanced control-flow
(like exceptions or generators) as libraries in the language.

### Exceptions
Let us start with the simplest effect: exceptions.

First, we declare our effect as follows

```
effect fileNotFound(path: String): Unit
```
which is a shorthand notation for:
```effekt:sketch
// Interface type / Computation type
//        vvvvvvvvvvvv
interface FileNotFound {
  def FileNotFound(path: String): Unit
  //  ^^^^^^^^^^^^
  // operation name
}
```
We then use it in some function

```effekt
def trySomeFile(f: String) = {
  println("Trying to open file " ++ f);
  do fileNotFound(f);
  println("Unreachable")
}
```
Here we use our `fileNotFound` effect operation with the syntax `do FileNotFound(f)`
passing the file as a string argument to the effect operation.
The inferred type of `trySomeFile` is

```effekt:sketch
def trySomeFile(f: String): Unit / { fileNotFound } = ...
```
That is, it communicates that the context still needs to handle `fileNotFound`.

> **Remark**
> Builtin side-effects like printing to the console are tracked, but cannot
> be handled, and their semantics is fixed. Hence, we do not track them as
> effects, but as [second-class _resources_](https://doi.org/10.1145/3527320).

#### Handling Exceptions
Everybody familiar with exception handling knows what comes next: we call
our function `trySomeFile` and handle the exception:

```
def handled() =
  try { trySomeFile("myFile.txt") }
  with fileNotFound { (path: String) => println("Error " ++ path) }
```
You can try running `handled`:
```effekt:repl
handled()
```
The inferred type of `handled` communicates that no effect is left:
```
def handledType(): Unit / {} = handled()
```
As a side-note, the above handler is actually short-hand syntax for
```effekt:sketch
def handled() =
  try { trySomeFile("myFile.txt") }
  with fileNotFound {
    def fileNotFound(path: String) = println("Error " ++ path)
  }
```
since in general one effect can group multiple operations.


#### Resuming Exceptions
Tracking effects and handling them is great, but it is fairly standard.
Exceptions transfer the control-flow from the caller (e.g. `do fileNotFound(f)`)
to the handler (e.g. `try {... } with fileNotFound { ... }`).

What might come with surprise is that in Effekt the handler can also resume
to the original call-site:

```effekt
def handledResume() =
  try { trySomeFile("myFile.txt") }
  with fileNotFound { (path: String) =>
    println("Creating file:" ++ path);
    resume(())
  }
```
Here the keyword `resume` expresses that the execution should proceed at the
original call to the effect operation `fileNotFound`.

Running `handledResume()` now prints `Unreachable`:
```effekt:repl
handledResume()
```
Since the return type of the effect operation is `Unit` the argument to
`resume` is a unit-value (e.g. `()`).

### Exhaustive Search
The possibility to resume to the call site allows programmers to fix error
conditions and proceed the original program. However, it also allows to express
many interesting advanced control-flow structures.

One example is that of [parsers]({{ site.githuburl }}/blob/main/examples/pos/parser.effekt)
or backtracking search.

Here, we repeat a small example that performs an exhaustive search for
three distinct numbers below `n` that add up to a given number `s`.

A solution is a triple of three integers:
```
record Solution(first: Int, second: Int, third: Int)
```
We now use two different effect operations to express nondeterminism:

```
effect flip(): Bool
effect fail(): Nothing
```
The first effect `Flip` returns a boolean, representing a nondeterministic
choice. The second effect `Fail` returns a polymorphic `A` to be usable at
all positions. It represents a failing branch in the search tree.
We can now write a function `choice` modelling choosing a number
between 1 and n:

```effekt
def choice(n : Int): Int / { flip, fail } =
  if (n < 1) { do fail() }
  else if (do flip()) { n }
  else { choice(n - 1) }
```
If `n` is smaller than `1`, we terminate the search. Otherwise we flip a coin
to either return `n` or try with `n - 1`.

Modeling our search problem now becomes:

```effekt
def triple(n: Int, s: Int): Solution / { flip, fail } = {
  val i = choice(n);
  val j = choice(i - 1);
  val k = choice(j - 1);
  if ((i + j + k) == s) {
    Solution(i, j ,k)
  } else {
    do fail()
  }
}
```
We simply choose three times and check whether the three numbers add up to the
searched number `s`, if not we fail.

Both functions `choice` and `triple` communicate in their type that they require
the `flip` and `fail` effect operations to be handled.

To enumerate all possible solutions and collect them in a list, we can write
the following effect handler:

```
def handledTriple(n: Int, s: Int): List[Solution] / {} =
  try {
    try {
      [ triple(n, s) ]
    } with fail { () => [] }
  } with flip { () => resume(true).append(resume(false)) }

def printSolutions(solutions: List[Solution]): Unit =
  solutions.foreach {
    case Solution(first, second, third) =>
      println("(" ++ first.show ++ ", "++ second.show ++ ", " ++ third.show ++ ")")
  }
```
If we encounter a `fail`, we give up with the empty list as the result. Otherwise,
on encounter of a `flip`, we try both alternatives (`resume(true)` and `resume(false)`).
Calling `resume(true)` gives us a list since the type of the body of the
corresponding `try` returns a list of solutions. To compute the overall result,
we simply append the two subsolutions.

We can run `handledTriple`:

```effekt:repl
handledTriple(6, 9).printSolutions
```
