---
layout: docs
title:  "Introduction to Effekt"
permalink: docs/introduction
---

# Quick Introduction to Effekt
In this section, you can find a few examples and some details about the
Effekt language.

{% for x in site.pages %}
  {% if x.section == 'docs' and x.title != page.title %}
- [{{x.title}}]({{site.baseurl}}{{x.url}})
  {% endif %}
{% endfor %}

Let's start with a simple example function that prints `"Hello World!"` to the console:
```effekt
def main() = {
  println("Hello World!")
}
```

```effekt:repl
main()
```

## Syntax
The Syntax is heavily inspired by the [Scala language](http://scala-lang.org). So
users familiar with Scala should have no problems getting started. Right now
the syntax is not documented very well and also subject to change. So the best
way to learn it is by looking at
[examples]({{ site.githuburl }}/tree/master/examples/pos),
or even looking into the [parser implementation]({{ site.githuburl }}/blob/master/shared/src/main/scala/effekt/Parser.scala).

One particular thing important to note: statements are semicolon _separated_.
That is, a semicolon is required between statements, but not allowed in a
trailing position. This will potentially change soon.

## Example: Lists
To familiarize ourselves, let's start by reimplementing lists, similar to how they are implemented in the [standard library]({{ site.githuburl }}/blob/master/libraries/common/list.effekt).


#### Module Declarations
All Effekt files start with a module declaration
```effekt:sketch
module mylib/mylist
```

It is important that the qualified module name coincides with the path from
the project root / include path. That is, the file for our module should live
under `./mylib/mylist.effekt`.

#### Datatype Declarations
The algebraic datatype for lists is declared as follows:
```effekt:sketch
type List[A] {
  Nil();
  Cons(head: A, tail: List[A])
}
```
It describes a closed union type of records `Nil` and `Cons`. Values of type
`List[Int]` are constructed as follows:
```
val l: List[Int] = Cons(1, Cons(2, Cons(3, Nil())))
```

For lists, there is syntactic sugar and the same list can also be written as
```
val l2: List[Int] = [1, 2, 3]
```

#### Pattern Matching
Field names need to be provided in ADTs, but can't be directly accessed.
Instead, we need to perform pattern matching like in the definition of `size`:
```
def size[A](l: List[A]): Int = l match {
  case Nil() => 0
  case Cons(_, rest) => 1 + size(rest)
}
```
Matching on the different variants binds there components in the body on the
right of `=>`.

#### Function Application
As you can see, functions like `size` are called like `size(l)`. Additionally,
Effekt also supports uniform-function call sytax and you can
call the same function as `l.size`. This also works if our function takes
multiple arguments, like append:
```
def myAppend[A](self: List[A], other: List[A]): List[A] = <>
```
and call it:
```effekt:repl
[1, 2, 3].myAppend([4, 5, 6])
```
Functions have to be always applied fully! There is no currying / uncurrying
in Effekt. As we will see, this is important to reason about (side) effects.
As you might have noticed, we only stubbed the implementation of `myAppend`.
Here, `<>` denotes a "hole"; forcing a hole creates a runtime error.

#### Records
You can define a record as follows:
```
record Queue[A](front: List[A], back: List[A])
val q = Queue([1, 2], [3, 4])
```
Like constructors, records can be created with function application syntax:

```effekt:repl
Queue(Nil(), [1, 2, 3])
```
However, records also admit direct access to their components:
```effekt:repl
front(q)
```
... or in method application style:
```effekt:repl
q.back
```
#### Functions
Functions can take other functions as arguments. Following Ruby-jargon,
we sometimes call those argument functions _blocks_.

Here is the definition of `myMap` that takes a block, which it applies to every
element in the list:

```
def myMap[A, B](l: List[A]) { f: A => B } : List[B] =
  l match {
    case Nil() => Nil()
    case Cons(a, rest) => Cons(f(a), myMap(rest) {f})
  }
```
The signature of `myMap` is read as follows:

> "For every two types `A` and `B`, given a value `l` of type `List[A]` and
> a block `f` from `A` to `B`, this function returns a value of type `List[B]`".

We purposefully call `l` a value and `f` a block, since in Effekt these are
two different universes that cannot be mixed. Blocks are not values, they are
_computations_. Effekt also has other kinds of computations (like objects and regions)
that we will cover later on. All computations have in common that they live
in a different universe than values and that they are passed in curly braces.
In general, computation is _second-class_ it cannot (directly) be stored in variables, data structures,
or be returned from functions.

However, we can pass computation (such as blocks) as arguments to functions.
Using method-application syntax, we can call `myMap` as follows:

```effekt:repl
l.myMap { x => x + 1 }
```

#### Variables: Local Mutable State
While Effekt has its heritage in functional programming, it offers convient
imperative style features like mutable variables:
```
def vars() = {
  var x = 10;
  while (x > 0) {
    println(x);
    x = x - 1
  }
}
```
This function local, mutable state is designed in a way that it interacts well
with other more advanced features like control effects.

### More Advanced Features
There is much more to Effekt. Some of the more advanced features are
described in the Section [Core Concepts](concepts)
