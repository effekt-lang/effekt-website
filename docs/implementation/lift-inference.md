---
layout: docs
title: Lift Inference
---

# Lift Inference

> **Important**: With release 0.4.0, Effekt moved away from this implementation strategy to explore other novel implementation techniques. This site is kept for historic purposes, only.

Programs in the Effekt surface language are translated to the underlying Core language,
which is in explicit capability-passing style. Core corresponds to `System Xi` in
[this paper](https://se.cs.uni-tuebingen.de/publications/brachthaeuser20effects/) and
`System C` in [this paper](https://se.cs.uni-tuebingen.de/publications/brachthaeuser22effects/).

In order to efficiently compile programs in Core, the overhead incurred by using
effect handlers should be minimized. In particular, the search for the correct handler
at runtime should be avoided. This can be facilitated by making so-called lifting
information explicit and using this information for a translation to iterated CPS.


### Lifting Information

What does lifting information mean? Consider the following example:

```effekt
effect Exc1(): String
effect Exc2(): String

def main() =
  try {
    def abort(): String / {} = { do Exc1() }
    try {
      abort()
    } with Exc2 {
      () => "aborted two"
    }
  } with Exc1 {
    () => "aborted one"
  }
```

<div class="core-out"><h4>Generated Core</h4>
<pre><code class="hljs effekt language-effekt:read-only:ignore">def main2916() =
  try { (){Exc1$capability4096} =>
    def abort2920() = Exc1$capability4096.Exc1()

    try { (){Exc2$capability4099} =>
      abort2920()
    } with Exc22915 {
      def Exc22918(){resume2921} =  "aborted two"
    }
  } with Exc12914 {
    def Exc12917(){resume2919} =  "aborted one"
  }</code></pre>
</div>

```effekt:repl
main()
```

In this program two exception effects, `Exc1` and `Exc2` are declared. The block `abort`
is defined within the outer handler, which handles `Exc1`, and simply performs the effect
operation `Exc1`. As is visible in the signature of `abort` (with an empty effect set) the
effect is handled by the outer handler, even though `abort` is called inside of the inner
handler. The result of running the program thus is `"aborted one"`.

Below the source the corresponding code in Core is shown. There the effect
operations become explicit capabilities bound at the corresponding handlers. When `abort`
is called, the `Exc1`-capability is executed and has to jump over the inner handler to its
binding site, or to put it differently, it has to be lifted. At runtime this amounts to
searching for the correct handler on the stack. By making explicit which capabilities
have to be lifted to which handlers, such a runtime search can be rendered unnecessary.


### Regions and subregion evidence

A structured way to make explicit which capability has to be lifted to which handler
is to introduce a region system and explicit subregion evidence. Every handler opens a
new region in its body and the corresponding capability has to run in this exact region.
Each handler then additionally binds evidence that the new region it opens is a subregion
of the region it is defined in. The capability bound by the handler can then be called
in every subregion of the handler by providing it with the correct subregion evidence.

Consider the following variation of the above example without the `abort`-block:

```effekt
effect Exc1(): String
effect Exc2(): String

def main() =
  try {
    try {
      do Exc1()
    } with Exc2 {
      () => "aborted two"
    }
  } with Exc1 {
    () => "aborted one"
  }
```

<div class="core-out"><h4>Generated Lifted Core</h4>
<pre><code class="hljs effekt language-effekt:read-only:ignore">def main(ev4497: EV): String =
  try { (ev4499: EV, Exc1$capability: Exc1) =>
    try { (ev4501: EV, Exc2$capability: Exc2) =>
      Exc1$capability.Exc1(&lt;ev4501>)
    } with Exc2 {
      def Exc2(ev4500: EV) =
        shift(&lt;ev4500>) { (resume: (EV, String) => String) =>
          "aborted two"
        }
    }
  } with Exc1 {
    def Exc1(ev4498: EV) =
      shift(&lt;ev4498>) { (resume: (EV, String) => String) =>
        "aborted one"
      }
  }</code></pre>
</div>

Below the source, the Lifted Core intermediate representation (which corresponds
to `LambdaCap` in [this paper](https://se.cs.uni-tuebingen.de/publications/schuster22typed/)) is shown.
In Lifted Core the subregion evidence is explicit. The inner handler binds evidence
that its new region is a subregion of the region of the outer handler and this evidence is
then provided in the call of `Exc1`, making it explicit that `Exc1` has to jump over the
inner handler to run in the region of the outer handler.


### Region and evidence inference

Back to the original example, where `Exc1` is called in the definition of `abort`. But
what is the correct evidence for `Exc1` then? The problem is that at the point of the
definition of `abort` it is not yet known where `abort` will be called. In the example
`abort` is called inside the inner handler and hence `Exc1` should again be provided with
the evidence bound at the inner handler. But in general `abort` could also be called in a
different region.

To account for this, it is possible for functions in Lifted Core to abstract over evidence.
The idea is to have a new region for each function which is later instantiated with the
region where the function is called. The function thus abstracts over evidence that this
new region is a subregion of the region at the definition-site of the function.

This is illustrated in the Lifted Core code for the original example repeated below.

```effekt
effect Exc1(): String
effect Exc2(): String

def main() =
  try {
    def abort(): String / {} = { do Exc1() }
    try {
      abort()
    } with Exc2 {
      () => "aborted two"
    }
  } with Exc1 {
    () => "aborted one"
  }
```
<div class="core-out"><h4>Generated Lifted Core</h4>
<pre><code class="hljs effekt language-effekt:read-only:ignore">def main(ev4153: EV): String =
  try { (ev4155: EV, Exc1$capability: Exc1) =>
    def abort(ev4158: EV): String =
      Exc1$capability.Exc1(&lt;ev4158>)

    try { (ev4157: EV, Exc2$capability: Exc2) =>
      abort(&lt;ev4157>)
    } with Exc2 {
      def Exc2(ev4156: EV) =
        shift(&lt;ev4156>) { (resume: (EV, String) => String) =>
          "aborted two"
        }
    }
  } with Exc1 {
    def Exc1(ev4154: EV) =
      shift(&lt;ev4154>) { (resume: (EV, String) => String) =>
        "aborted one"
      }
  }</code></pre>
</div>

Here `abort` abstracts over evidence which is then passed to `Exc1`, since this evidence
states that the new region of `abort` is a subregion of the region of the outer handler,
where `Exc1` has to run. When `abort` is called it needs to be provided the correct evidence,
which here is the one bound by the inner handler (because `abort` runs in the region of that
inner handler). Since that evidence is then passed to `Exc1` this is exactly right.


### Higher-order Functions

The inference of regions and subregion evidence also works for higher-order blocks, but
things get a bit more complicated there.

The problem is that block parameters can be effectful, too, which means that they also have
to be passed appropriate evidence. Which evidence is, however, only known when the block
parameter is instantiated. Therefore, a block needs to abstract additional evidence for
each of its block parameters. This additional evidence describes that the region of the
block itself is a subregion of the region where the block argument was defined.

Look at the following (somewhat silly) variation of the example above with a very simple
higher-order function `call`, which simply calls its block argument.

```effekt
effect Exc1(): String
effect Exc2(): String

def main() = {
  def call { f: () => String } = { f() }
  try {
    def abort(): String / {} = { do Exc1() }
    try {
      call { abort }
    } with Exc2 {
      () => "aborted two"
    }
  } with Exc1 {
    () => "aborted one"
  }
}
```
<div class="core-out"><h4>Generated Lifted Core</h4>
<pre><code class="hljs effekt language-effekt:read-only:ignore">def main(ev4190: EV): String =
  def call(ev4196: EV, ev4197: EV, f: (EV) => String): String =
    f(&lt;ev4197>)

  try { (ev4192: EV, Exc1$capability: Exc1) =>
    def abort(ev4195: EV): String =
      Exc1$capability.Exc1(&lt;ev4195>)

    try { (ev4194: EV, Exc2$capability: Exc2) =>
      call(&lt;ev4194, ev4192>, &lt;ev4194>, abort)
    } with Exc2 {
      def Exc2(ev4193: EV) =
        shift(&lt;ev4193>) { (resume: (EV, String) => String) =>
          "aborted two"
        }
    }
  } with Exc1 {
    def Exc1(ev4191: EV) =
      shift(&lt;ev4191>) { (resume: (EV, String) => String) =>
        "aborted one"
      }
  }</code></pre>
</div>

In Lifted Core `call` has two evidence parameters, where the second one is for the block
parameter `f`, and is also passed to `f`. When `call` is applied it gets two evidence
arguments. The first one is the composition of the evidence of both handlers, since `call`
was defined outside of both. The second evidence consists only of the one bound by the inner
handler, as this is the one passed to the block argument `abort` (defined in the region of
the outer handler) which then passes it on to `Exc1`, which again is exactly right.
