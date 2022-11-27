---
layout: docs
title: Bidirectional Effects
permalink: docs/concepts/bidirectional
---

# Bidirectional Effects

Effekt implements a feature called _"bidirectional effects"_ or
_"bidirectional control-flow"_. The idea of bidirectional effects has been
introduced by Zhang et al. in their [OOPSLA'20 paper](https://dl.acm.org/doi/10.1145/3428207):

> "Handling bidirectional control flow".
> Yizhou Zhang, Guido Salvaneschi, and Andrew C. Myers. 2020.
> Proc. ACM Program. Lang. 4, OOPSLA, Article 139 (November 2020).

## Effects in Both Directions
Let us assume the following standard definition of an exception effect:
```effekt
effect Exc[A](msg: String): A
```
The new feature of bidirectional effects is that effect operations can now be
declared to use additional effects. For example, here is the definition of a
`Get` effect that can fail:
```effekt
type Config = Int
effect Get(): Config / Exc
```
Calling a bidirectional effect introduces both the effect itself, as well as
its exposed implementation effects at the callsite.
```effekt
def user1(): Unit / { Get, Exc } =
  println(do Get())
```
The handler for `Get` can now trigger the exception effect in the scope of the
call to `Get`:

```effekt
def alwaysFail { prog: => Unit / Get }: Unit / {} = try {
  prog()
} with Get { resume { do Exc("Can't get the config, sorry.") } }
```
Note, how the return type of the handler `alwaysFail` mentions the empty effect
set, even though it uses the `Exc` effect.

This is only sound, since the `Exc` effect is handled at the _call-site_ of
`Get`:

```effekt
def user2(): Unit / { Get } = try {
  println(do Get())
} with Exc[A] { msg => println(msg) }
```
We can run the example to observe the result:
```effekt:repl
alwaysFail { user2() }
```
