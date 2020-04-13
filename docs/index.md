---
layout: docs
title:  "Introduction to Effekt"
position: 3
---

# Quick Introduction to Effekt
In this section, you can find a few examples and some details about the
Effekt language.

{% for x in site.pages %}
  {% if x.section == 'docs' and x.title != page.title %}
- [{{x.title}}]({{site.baseurl}}{{x.url}})
  {% endif %}
{% endfor %}

## Syntax
The Syntax is heavily inspired by the [Scala language](scala-lang.org). So
users familiar with Scala should have no problems getting started. Right now
the syntax is not documented very well and also subject to change. So the best
way to learn it is by looking at
[examples]({{ githuburl }}/tree/master/examples/pos),
or even looking into the [parser implementation]({{ githuburl }}/blob/master/shared/src/main/scala/effekt/Parser.scala).

One particular thing important to note: statements are semicolon _separated_.
That is, a semicolon is required between statements, but not allowed in a
trailing position. This will potentially change soon.

## Example: Lists
To familiarize ourselves, let's start by inspecting the implementation of
lists in the [standard library]({{ githuburl }}/effekt/tree/master/lib/immutable).


#### Module Declarations
All Effekt files start with a module declaration
```effekt
module immutable/list
```
It is important that the qualified module name coincides with the path from
the project root / include path. That is, the file for our module should live
under `./immutable/list.effekt`.

#### Datatype Declarations
The algebraic datatype for lists is declared as follows:
```
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
val l: List[Int] = [1, 2, 3]
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
inspired by the Koka language, there is some syntactic sugar and you can also
call the same function as `l.size`. This only works if the function takes
exactly one value argument. However, Effekt allows multiple argument
sections and we can define a function like
```
def append[A](self: List[A])(other: List[A]): List[A] = ...
```
and call it:
```
[1, 2, 3].append([4, 5, 6])
```
Functions have to be always applied fully! There is no currying / uncurrying
in Effekt. As we will see, this is important to reason about (side) effects.

#### Records
You can define a record as follows:
```
record Queue[A](front: List[A], back: List[A])
```
Like constructors, records can be created with function application syntax:

```
> val q = Queue(Nil(), [1, 2, 3])
Queue[Int]
```
However, records also admit direct access to their components:
```
> front(q)
Nil()
```
... or in method application style:
```
> q.back
Cons(1, Cons(2, Cons(3, Nil())))
```
#### Blocks
Functions can take other functions as arguments. Following Ruby-jargon,
we call those argument functions _blocks_.

Here is the definition of `map` that takes a block, which it applies to every
element in the list:

```
def map[A, B](l: List[A]) { f: A => B } : List[B] =
  l match {
    case Nil() => Nil()
    case Cons(a, rest) => Cons(f(a), map(rest) { a => f(a) })
  }
```
The signature of `map` is read as follows:

> "For every two types `A` and `B`, given a value `l` of type `List[A]` and
> a block `f` from `A` to `B`, this function returns a value of type `List[B]`".

We purposefully call `l` a value and `f` a block, since in Effekt these are
two different universes that cannot be mixed. Blocks are no values. They cannot
be stored in variables, data structures, or be returned from functions.

Just like functions, blocks also always need to be fully applied. This
requirement can be seen in the recursive application to `map`, where a block
is constructed only to apply `f`.

Using method-application syntax, we can call `map` as follows:

```
> [1,2,3].map { x => println(x) }
1
2
3
Cons((), Cons((), Cons((), Nil())))
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
described in the Section [Core Concepts](/docs/concepts)
