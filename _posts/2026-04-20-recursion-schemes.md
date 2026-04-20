---
author: Marvin Borner
date: 2026-04-20
layout: post
title: Effectful Recursion Schemes
---

``` effekt:prelude:hide
import set
```

Common functional programming languages such as Haskell use recursion
schemes to generalize folding/unfolding patterns. This typically
requires infinitely recursive types and some notion of functor
instancing. Today I want to showcase an effectful implementation of
recursion schemes that instead makes use of refunctionalizing data
structures to effects and handlers.

In fact, this post is much more about showcasing effects and handlers
than it is about recursion schemes themselves:

> This is an *interactive* blog, you are encouraged to experiment with
> the code!

Let's start by constructing some basic lambda terms as the running
example data structure.

``` effekt
type Term {
  Sym(name: String)
  Lam(name: String, body: Term)
  App(function: Term, argument: Term)
}
```

For example, the identity function `λx.x` is encoded as the following
term:

``` effekt:repl
Lam("x", Sym("x")).show
```

In Effekt, we can traverse these terms by matching and recursively
calling the traversing function. For example, in order to use a custom
`show` implementation instead of the default one:

``` effekt
def pretty(t: Term): String = t match {
  case Sym(x)    => x.show
  case Lam(x, b) => s"λ${x}.${b.pretty}"
  case App(f, a) => s"(${f.pretty} ${a.pretty})"
}
```

``` effekt:repl
App(Lam("x", Lam("y", Sym("x"))), Lam("x", Sym("x"))).pretty
```

In fact, this would be a great use for a `fold` function on terms. The
*catamorphism* recursion scheme generalizes folds. Instead of calling
`pretty` on a `b: Term`, the body that's matched upon is *already* the
result of the recursive call, i.e. `b: String`. Optimally, the
catamorphic version of `pretty` would look something like the following:

``` effekt:ignore
def pretty?(t: Term): String = <{"something with cata"}> {
  case Sym(x)    => x.show
  case Lam(x, b) => s"λ${x}.${b}"
  case App(f, a) => s"(${f} ${a})"
}
```

## Catamorphism

Traditionally, you would then have a separate, parametrized `TermF`,
where all recursive occurrences of `Term` are replaced by a type
variable. The previous type `Term` then becomes
`TermF (TermF (TermF ...))`, i.e. it has an infinitely recursive type.
Effekt does not support infinite types though!

What Effekt *does* support, however, is effects and handlers. You can
learn more about Effekt's use of effects [in our tour](/tour/effects).
The refunctionalized variant of `Term` is then defined by the following
interface:

``` effekt
interface TermF[T, R] {
  def sym(name: String): R
  def lam(name: String, body: T): R
  def app(function: T, argument: T): R
}
```

For example, a call to `sym` could be handled like the following: (note
how it now requires the `do`-prefix, as it is an effect)

``` effekt:repl
try do sym("x") with TermF[String, String] {
  def sym(x)    = s"got ${x}!"
  def lam(x, b) = <{"not implemented"}>
  def app(f, a) = <{"not implemented"}>
}
```

*Trick question:* Try replacing `do sym("x")` with
`do lam("x", do sym("x"))`. Why does this not give a `"not implemented"`
error?

*Answer:* Once `do sym("x")` is handled, the entire term
`do lam("x", do sym("x"))` has become `"got x!"`. In order to provide
the string as a return value to the call `do sym("x")`, one must give
back the desired value via `resume`.

``` effekt:repl
try do lam("x", do sym("x")) with TermF[String, String] {
  def sym(x)    = resume(x)
  def lam(x, b) = resume(s"λ${x}.${b}")
  def app(f, a) = resume(s"(${f} ${a})")
}
```

An effectful implementation of a catamorphism is merely a generalization
of this `Term` → `TermF[A]` pattern. `cata` has `TermF[A]` in the effect
signature, as these effects must be handled by a calling context:

``` effekt
def cata[A](t: Term): A / TermF[A, A] = t match {
  case Sym(x)    => do sym(x)
  case Lam(x, b) => do lam(x, b.cata)
  case App(f, a) => do app(f.cata, a.cata)
}
```

We can rewrite the `pretty` function from before as a catamorphism:

``` effekt
def pretty!(t: Term) = try t.cata with TermF[String, String] {
  def sym(x)    = resume(x)
  def lam(x, b) = resume(s"λ${x}.${b}")
  def app(f, a) = resume(s"(${f} ${a})")
}
```

``` effekt:repl
App(Lam("x", Lam("y", Sym("x"))), Lam("x", Sym("x"))).pretty!
```

Similarly, we can use `cata` to count the constructors of a lambda term
-- without explicit recursion!

``` effekt
def size(t: Term) = try t.cata with TermF[Int, Int] {
  def sym(x)    = resume(1)
  def lam(_, b) = resume(1 + b)
  def app(f, a) = resume(1 + f + a)
}
```

``` effekt:repl
App(Lam("x", Lam("y", Sym("x"))), Lam("x", Sym("x"))).size
```

Or return all free variables in a term:

``` effekt
def free(t: Term) = try t.cata with TermF[Set[String], Set[String]] {
  def sym(x)    = resume(x.singletonGeneric)
  def lam(x, b) = resume(b.difference(x.singletonGeneric))
  def app(f, a) = resume(f.union(a))
}.toList

def freeIn(x: String, t: Term) = t.free.contains(x) { (a, b) => a == b }
```

``` effekt:repl
App(Lam("x", Lam("y", Sym("x"))), Lam("x", Sym("z"))).free
```

## Paramorphism

Compared to `cata`, `para` also passes the original data structure to
the handler. This can be implemented by extending `cata` to pass a tuple
to the handler with the original term:

``` effekt
def para[A](t: Term): A / TermF[(Term, A), A] = t match {
  case Sym(x)    => do sym(x)
  case Lam(x, b) => do lam(x, (b, b.para))
  case App(f, a) => do app((f, f.para), (a, a.para))
}
```

In substitutions `t[x/r]`, for example, this can be used to prevent
recursion into the term `t` that is being substituted, if it also binds
the variable `s`:

``` effekt
def substitute(t: Term, x: String, r: Term) = try t.para with TermF[(Term, Term), Term] {
  def sym(y) = resume(if (x == y) r else Sym(y))
  def lam(y, b) = resume(
    if (x == y) Lam(y, b.first) // shadowing!
    else if (y.freeIn(r)) <> // alpha-renaming (omitted)
    else Lam(y, b.second))
  def app(f, a) = resume(App(f.second, a.second))
}
```

``` effekt:repl
App(Lam("x", Lam("y", Sym("x"))), Lam("x", Sym("z"))).substitute("z", Sym("foo"))
```

## Anamorphism

Anamorphisms are all about unfolding structures from a single seed. They
are dual to catamorphisms, which fold structures into a single value.

Consider the following program that emits every natural number using the
`emit` effect from the standard library.

``` effekt:repl
def nats(s: Int): Unit / emit[Int] = { do emit(s); nats(s + 1) }

list::collect[Int] { limit[Int](10) { nats(0) } }
```

Here, the seed of the unfold is `s`, where the recursive calls provide
the seed for the next iteration. The emitted values of the unfolding are
then collected using the `collect` function.

We can generalize this to an `ana` function for list construction, using
a `cons` effect to provide the next seed directly in its second field:

``` effekt
effect cons[S, R](hd: R, tl: S): List[R]

def ana[S, R](s: S) { coalg: S => List[R] / { cons[S, R], stop } }: List[R] = try coalg(s)
  with cons[S, R] { (hd, tl) => resume(Cons(hd, tl.ana{coalg})) }
  with stop { Nil[R]() }
```

This definition also allows for the `stop` effect in order to forcefully
stop the unfolding. For example, to print the fibonacci series until
`n`:

``` effekt:repl
def fib(n: Int) = ana[(Int, Int, Int), Int]((0, 0, 1)) { case (i, a, b) =>
  if (i == n) do stop()
  else do cons(a, (i + 1, b, a + b))
}
fib(10)
```

For lambda terms, we may now construct a very similar function. Here,
the parametrization over `R` is not required, as `Terms`s can only
contain `Term`s:

``` effekt
def ana[S](s: S) { coalg: S => Term / TermF[S, Term] }: Term = try coalg(s) with TermF[S, Term] {
  def sym(x)    = resume(Sym(x))
  def lam(x, b) = resume(Lam(x, b.ana{coalg}))
  def app(f, a) = resume(App(f.ana{coalg}, a.ana{coalg}))
}
```

If you compare this definition to `cata` from above, you may note how it
is indeed perfectly dual -- instead of executing effects, we now handle
effects!

We can use this for all kinds of seeds. For example, say we want to
convert lambda terms that use [de Bruijn
indices](https://en.wikipedia.org/wiki/De_Bruijn_index) (`DTerm`) to the
previous `Term`. Then, starting from an empty environment and the de
Bruijn indexed term (the seed), we can increasingly fill the environment
while the `DTerm` gets smaller and the `Term` emerges from the effectful
construction:

``` effekt
type DTerm {
  DIdx(index: Int)
  DLam(body: DTerm)
  DApp(function: DTerm, argument: DTerm)
}

effect fresh(): String
def freshener[R] { prog: => R / fresh } = {
  var x = 0
  try prog() with fresh {
    x = x + 1
    resume(s"x${x.show}")
  }
}

def fromDeBruijn(t: DTerm) =
  with on[OutOfBounds].panic()
  with freshener
  ana((t, Nil[String]())) {
    case (DIdx(i), env)    => do sym(env.get(i))
    case (DLam(b), env)    => val x = do fresh(); do lam(x, (b, Cons(x, env)))
    case (DApp(f, a), env) => do app((f, env), (a, env))
  }
```

``` effekt:repl
fromDeBruijn(DApp(DLam(DLam(DIdx(1))), DLam(DIdx(0)))).pretty
```

## Hylomorphism

The hylomorphism combines the catamorphism and anamorphism. As in the
anamorphism, we start from a seed that starts to unfold. Then, as in the
catamorphism, the unfolded structure gets folded back into a value. To
remind you, we have defined them both as the following: *(are you seeing
the symmetry?)*

``` effekt:ignore
def cata[A](t: Term): A / TermF[A, A] = t match {
  case Sym(x)    => do sym(x)
  case Lam(x, b) => do lam(x, b.cata)
  case App(f, a) => do app(f.cata, a.cata)
}

def ana[S](s: S) { coalg: S => Term / TermF[S, Term] }: Term = try coalg(s) with TermF[S, Term] {
  def sym(x)    = resume(Sym(x))
  def lam(x, b) = resume(Lam(x, b.ana{coalg}))
  def app(f, a) = resume(App(f.ana{coalg}, a.ana{coalg}))
}
```

Combining the two definitions yields a naive `hylo`:

``` effekt
def hyloNaive[S, A](s: S) { coalg: S => Term / TermF[S, Term] }: A / TermF[A, A] =
  s.ana{coalg}.cata
```

We could already now do the following, combining `pretty!` and
`fromDeBruijn` into one self-contained call to `hyloNaive`:

``` effekt:repl
val t = DApp(DLam(DLam(DIdx(1))), DLam(DIdx(0)))

with on[OutOfBounds].panic()
with freshener
try hyloNaive[(DTerm, List[String]), String]((t, Nil[String]())) {
  case (DIdx(i), env)    => do sym(env.get(i))
  case (DLam(b), env)    => val x = do fresh(); do lam(x, (b, Cons(x, env)))
  case (DApp(f, a), env) => do app((f, env), (a, env))
} with TermF[String, String] {
  def sym(x)    = resume(x)
  def lam(x, b) = resume(s"λ${x}.${b}")
  def app(f, a) = resume(s"(${f} ${a})")
}
```

The problem with `hyloNaive` is that it first constructs the terms
recursively only to directly deconstruct them again. Instead, `hylo` can
also be written in such a way that no additional `Term`s are
constructed. Here is a version that fuses `cata` and `ana`:

``` effekt
def hylo[S, A](s: S) { coalg: S => A / TermF[S, A] }: A / TermF[A, A] =
  try coalg(s) with TermF[S, A] {
    def sym(x)    = resume(do sym(x))
    def lam(x, b) = resume(do lam(x, b.hylo{coalg}))
    def app(f, a) = resume(do app(f.hylo{coalg}, a.hylo{coalg}))
  }
```

Note how `Term` has gone completely in this final variant!

## Your Turn!

Now it's your turn to experiment further with this construction of
recursion schemes. How could you implement a factorial via a
paramorphism or hylomorphism? How could a *histomorphism* and
*futumorphism* be defined in Effekt? Do you have other fun ideas for
Effekt code?

Here's a link to our [interactive
playground](https://effekt-lang.org/playground/), a [language
tour](https://effekt-lang.org/tour), and the [installation
instructions](https://effekt-lang.org/docs). Have fun!
