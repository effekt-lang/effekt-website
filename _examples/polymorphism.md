---
title: Polymorphism
date: 2022-11-03
---

# Polymorphism
This example is modified from ticket [#171](https://github.com/effekt-lang/effekt/issues/171).

```effekt
effect Optional {
  def none[A](): A
}

record Promise[A](taskId: Int)

effect Async {
  def async[A](fn: () => A at {}): Promise[A]
  def await[A](p: Promise[A]): A
}

def main(): Int = {
  try {
    doStuff { generateStuff() }
  } with Async {
    def async[A](fn) = 0
    def await[A](p) = 0
  } with Optional {
    def none[A]() = 0
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
