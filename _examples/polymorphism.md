---
title: Polymorphism
date: 2022-11-03
---

# Polymorphism
This example is modified from ticket [#171](https://github.com/effekt-lang/effekt/issues/171).

```effekt
import process

interface Optional {
  def none[A](): A
}

record Promise[A](taskId: Int)

interface Async {
  def async[A](fn: () => A at {}): Promise[A]
  def await[A](p: Promise[A]): A
}

def main(): Unit = {
  try {
    doStuff { generateStuff() }
    ()
  } with Async {
    def async[A](fn) = ()
    def await[A](p) = ()
  } with Optional {
    def none[A]() = ()
  }
}

def foo(): Int = 42

def generateStuff(): Int / { Optional, Async } = {
  val promise = do async(foo);
  do await(promise)
}

def doStuff { element: => Int / {} }: Int / {} =
  element() + 1

```
```effekt:repl
main()
```
