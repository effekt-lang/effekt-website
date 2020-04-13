---
layout: docs
title: Effect Handlers
permalink: docs/concepts/effect-handlers
---

## An Introduction to (Algebraic) Effect Handlers
Besides the built-in functions like `println` that have effects (e.g. `Console`),
which are tracked by the effect system, Effekt also offers _user definable control effects_.

This is fancy word for saying we can express advanced control-flow
(like exceptions or generators) as libraries in the language.

### Exceptions
Let us start with the simplest effect: exceptions.

First, we declare our effect as follows:

```
effect FileNotFound(path: String): Unit
```
and then use it in some function

```
def trySomeFile(f: String) = {
  println("Trying to open file " ++ f);
  do FileNotFound(f);
  println("Unreachable")
}
```
Here we use our `FileNotFound` effect with the syntax `do FileNotFound(f)`
passing the file as a string argument to the effect operation.
The inferred type of `trySomeFile` is

```
def trySomeFile(f: String): Unit / { Console, FileNotFound } = ...
```
That is, it communicates that the context needs to handle `Console` and
`FileNotFound`.

>**Remark**
> Builtin effects like `Console` are actually only tracked,
> but never handled. That is, the `main` function can still have unhandled
> builtin effects.

#### Handling Exceptions
Everybody familiar with exception handling knows what comes next: we call
our function `trySomeFile` and handle the exception:

```
def handled() =
  try { trySomeFile("myFile.txt") }
  with FileNotFound { (path: String) => println("Error" ++ path) }
```
Running `handled` now prints:
```bash
> handled()
Trying to open file myFile.txt
Error myFile.txt
```
The inferred type of `handled` communicates that it only has the requirement
of the `Console` effect left:
```
def handled(): Unit / { Console }
```
#### Resuming Exceptions
Tracking effects and handling them is great, but it is fairly standard.
Exceptions transfer the control-flow from the caller (e.g. `do FileNotFound(f)`)
to the handler (e.g. `try {... } with FileNotFound { ... }`).

What might come with surprise is that in Effekt the handler can also resume
to the original call-site:

```
def handledResume() =
  try { trySomeFile("myFile.txt") }
  with FileNotFound { (path: String) =>
    println("Error" ++ path);
    resume(())
}
```
Here the keyword `resume` expresses that the execution should proceed at the
original call to the effect operation `FileNotFound`.

Running `handledResume()` now gives:
```bash
> handledResume()
Trying to open file myFile.txt
Error myFile.txt
Unreachable
```
Since the return type of the effect operation is `Unit` the argument to
`resume` is a unit-value (e.g. `()`).

### Exhaustive Search
The possibility to resume to the call site allows programmers to fix error
conditions and proceed the original program. However, it also allows to express
many interesting advanced control-flow structures.

One example is that of [parsers]({{ githuburl }}/blob/master/examples/pos/parser.effekt)
or backtracking search.

Here, we repeat a small example that performs an exhaustive search for
three distinct numbers below `n` that add up to a given number `s`.

We start with the module declaration and using `immutable/list` from the
standard library:

```
module triples
import immutable/list
```

A solution is a triple of three integers:
```
record Solution(first: Int, second: Int, third: Int)
```
We now use two different effect operations to express nondeterminism:

```
effect Flip(): Boolean
effect Fail[A](): A
```
The first effect `Flip` returns a boolean, representing a nondeterministic
choice. The second effect `Fail` returns a polymorphic `A` to be usable at
all positions. It represents a failing branch in the search tree.
We can now write a function `choice` modelling choosing a number
between 1 and n:

```
def choice(n : Int): Int / { Flip, Fail } =
  if (n < 1) { do Fail() }
  else if (do Flip()) { n }
  else { choice(n - 1) }
```
If `n` is smaller than `1`, we terminate the search. Otherwise we flip a coin
to either return `n` or try with `n - 1`.

Modeling our search problem now becomes:

```
def triple(n: Int, s: Int): Solution / { Flip, Fail } = {
  val i = choice(n);
  val j = choice(i - 1);
  val k = choice(j - 1);
  if ((i + j + k) == s) {
    Solution(i, j ,k)
  } else {
    do Fail()
  }
}
```
We simply choose three times and check whether the three numbers add up to the
searched number `s`, if not we fail.

Both functions `choice` and `triple` communicate in their type that they require
the `Flip` and `Fail` effects to be handled.

To enumerate all possible solutions and collect them in a list, we can write
the following effect handler:

```
def handledTriple(n: Int, s: Int): List[Solution] / {} =
  try {
    try {
      [ triple(n, s) ]
    } with Fail { () => [] }
  } with Flip { () => resume(true).append(resume(false)) }
```
If we encounter a `Fail`, we give up with the empty list as the result. Otherwise,
on encounter of a `Flip`, we try both alternatives (`resume(true)` and `resume(false)`).
Calling `resume(true)` gives us a list since the type of the body of the
corresponding `try` returns a list of solutions. To compute the overall result,
we simply append the two subsolutions.

Running `handledTriple` gives:

```
> handledTriple(6, 9)
Cons(Solution(6, 2, 1), Cons(Solution(5, 3, 1), Cons(Solution(4, 3, 2), Nil())))
```
