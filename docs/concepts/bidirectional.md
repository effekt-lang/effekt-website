---
layout: docs
title: Bidirectional Effects
permalink: docs/concepts/bidirectional
---

# Bidirectional Effects

Effekt implements a feature called _"bidirectional effects"_ or
_"bidirectional control-flow"_. The idea of bidirectional effects has been
introduced by Zhang et al. in their [OOPSLA'20 paper](https://doi.org/10.1145/3428207):

> "Handling bidirectional control flow".
> Yizhou Zhang, Guido Salvaneschi, and Andrew C. Myers. 2020.
> Proc. ACM Program. Lang. 4, OOPSLA, Article 139 (November 2020).

## Effects in Both Directions
Let us assume the following standard definition of an exception effect:
```effekt
effect exc(msg: String): Nothing
```
The new feature of bidirectional effects is that (effect) operations can now be
declared to use additional effects. For example, here is the definition of a
`Config` interface that features a potentially failing `port` operation:
```effekt
interface Config {
  def port(): Int / { exc }
}
```
Calling a bidirectional effect introduces both the effect itself, as well as
its exposed implementation effects at the callsite.
```effekt
def user1(): Unit / { Config, exc } =
  println(do port())
```
The handler for `Config` can now trigger the exception effect in the scope of the
call to `port`:

```effekt
def noConfig { prog: => Unit / Config }: Unit / {} = try {
  prog()
} with Config {
  def port() = resume { do exc("No port configured.") }
}
```
Note, how the return type of the handler `noConfig` mentions the empty effect
set, even though it uses the `exc` effect operation.

This is only sound, since the `exc` effect operation is handled at the _call-site_ of
`port`:

```effekt
def user2(): Unit / { Config } = try {
  println(do port())
} with exc { msg => println(msg) }
```
We can run the example to observe the result:
```effekt:repl
noConfig { user2() }
```

## Difference to "Normal" Handling
What would have happened if we would have defined `Config` as follows?

```effekt:reset
interface Config {
  def port(): Int / {}
}
```
```effekt:hide
effect exc(msg: String): Nothing
```

First of all, the typing of `user1` would have changed to not mention the `exc` effect operation, anymore.
```
def user1(): Unit / { Config } =
  println(do port())
```
But can we implement `noConfig`, now that exceptions are not allowed by the interface anymore?

Turns out we can. However, the exception is now raised at the handling site (that is
implementation site of `Config`), not at the callsite to `port`:
```
//                        Now the handler of Config requires exception handling
//                                                vvv
def noConfig { prog: => Unit / Config }: Unit / { exc } = try {
  prog()
} with Config {
  def port() = do exc("No port configured.")
}
```

At the handling site, we now also need to deal with the exception, while the user of `port` is agnostic of the potential exception:

```effekt:repl
try {
  noConfig { user1() }
} with exc { msg => println("Used port, but no config available.") }
```
