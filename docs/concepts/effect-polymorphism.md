---
layout: docs
title: Lightweight Effect Polymorphism
permalink: docs/concepts/effect-polymorphism
---

# Lightweight Effect Polymorphism

Tracking effects statically in the type is a great way to achieve safety. However, often, as soon as
you start writing _higher-order functions_ the type- and effect system starts to get
into your way.

### Effect Polymorphism
Not so in Effekt! It features a new form of effect polymorphism, which we call **contextual effect polymorphism**.


```effekt:hide
import list

effect Break(): Unit

type File = List[String]
def eachLine(file: File) { f: String => Unit / {} }: Unit / {} =
  file.foreach { line => f(line) }

val someFile = ["first line", "second line", "", "third line"]
```
```
def printLines(file: File) = try {
    eachLine(file) { line =>
      if (line == "") { do Break() }
      else { println(line) }
    }
  } with Break {
    println("found an empty line, aborting!")
  }
```

The higher-order function `eachLine` expects two arguments: firstly, a
_value argument_, which is passed in parenthesis.
Secondly, a _block argument_, which is passed in curly braces.
It calls the provided block with each line in the file.

The signature of `eachLine` in Effekt is:

```effekt:sketch
def eachLine(file: File) { f: String => Unit / {} }: Unit / {}
```
Note that the signature does not say anything about effects.


### The Traditional Reading
In traditional effect systems, this would be read is:

> "given a block `f` that has no effects, `eachLine` also has no effects".

Given that reading, we couldn't use `eachLine` as in our example, since the block passed
to `eachLine` uses two effects <code class="language-effekt">Break</code> and <code class="language-effekt">Logger</code>
(due to `println`).


### The Contextual Reading
In Effekt, we apply a different reading, which we call **contextual**:
> "given a block `f` without any further requirements, `eachLine` does not require any effects."

The function `eachLine` is effect polymorphic. We can call it with arbitrary
blocks, indepedent of the effects the block arguments use.

The type ofthe block parameter `f` tells us that it does not impose any
_requirements_ on its caller _within_ `eachLine`.
However, it _can have_ effects, that simply need to be handled _at the call-site_
of `eachLine`.


### Contextual Effect Polymorphism by Example
Here are some examples of calling `eachLine`. For example, we can provide a block that does not use any effects:
```effekt:repl
eachLine(someFile) { line => () }
```
The type of the block is <code class="language-effekt">String => Unit / {}</code> and
the overall type of the call is <code class="language-effekt">Unit / {}</code>.

Further, given the <code class="language-effekt">Logger</code> effect
```effekt
interface Logger {
  def log(msg: String): Unit
}
```
 we can provide a block that uses it:
```effekt:sketch
eachLine(someFile) { line => do log(line) }
```
The type of the block is <code class="language-effekt">String => Unit / { Logger }</code> and
the overall type of the call now becomes <code class="language-effekt">Unit / { Logger }</code>.
Since it still has unhandled user effects, it does not type-check and we cannot run it.

To be able to run it, we handle the user-effect at the call-site to `eachLine`, for example
by printing to the console:
```
def printLogger[R] { prog: () => R / Logger }: R =
  try { prog() } with Logger { def log(msg) = resume(println(msg)) }
```
```effekt:repl
printLogger {
  eachLine(someFile) { line => do log(line) }
}
```

Now, the effects that are used by the block argument are handled in its _lexical scope_.
