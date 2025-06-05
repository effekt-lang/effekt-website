---
layout: docs
title: Exercise 'Challenge'
permalink: docs/exercises/challenge
---

# Bonus task: 'Challenge: TTY Formatting'

In Effekt, create a tiny & correct TTY (terminal) formatting library using effects and handlers.

## Problem statement:

If you do `red("Hello, " ++ bold("world") ++ "!!!")` with naive definitions
like `red(s) := Escape::RED ++ s ++ Escape::RESET` and `bold(s) := Escape::BOLD ++ s ++ Escape::RESET`,
this produces `<RED>Hello, <BOLD>world<RESET>!!!<RESET>` which means that the exclamation marks are **not** red, which might be unexpected.

You must use effects and handlers to model this, restoring the state of the world correctly:
the output of the call above should be `<RED>Hello, <BOLD>world<RESET><RED>!!!<RESET>` instead
(note that the red is “reinstalled” after the reset).

The solution doesn't need to be minimal (it's fine to output “unnecessary” modifiers),
the calls to `red` and `bold` can look different.

The solution should _scale_ enough to be still nice when supporting “the whole spec”:
different colours (exclusive), styles like bold, italic, underline, etc. (not exclusive).

There should be one handler that does all formatting and a different handler that doesn't (for, let's say, CI!).

Here are the relevant escapes for testing (feel free to comment out):
```effekt
val RED = "\u001b[31m"
val BOLD = "\u001b[1m"
val RESET = "\u001b[0m"
```
You can also find them in `tty` in stdlib. (Just write `import tty` and jump to definition. They are called `ANSI::RED` etc...)

**Hints:**
- we highly encourage you to experiment here, try printing things to see how they look in your terminal!
- it's perfectly OK to output `<RED>`, `<BOLD>` and `<RESET>` for testing purposes when working on the problem
- bidirectional / higher-order effects might be helpful here

You can use the following editor to work on your solution:

```effekt
def main() = ()
```

and REPL to run things:

```effekt:repl
main()
```

If you want to share your solution, you can use our [playground](/playground) which allows shareable links.

---

[Back to Exercises](/docs/exercises)
