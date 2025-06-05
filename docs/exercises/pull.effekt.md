---
layout: docs
title: Exercise 'Pull'
permalink: docs/exercises/pull
---

# Bonus exercise: 'Pull'

```effekt
import test
import char
```

In this task, we'll play with pull streams.
Here are some effect definitions:

```effekt
/// Signal from a producer to a consumer that there are no further values.
/// = early exit
effect stop(): Nothing

/// emit (push stream): emits/produces values of type `A`
/// = producer
///
/// (you already know these!)
effect emit[A](value: A): Unit

/// read (pull stream): requires values of type `A`
/// = consumer
///
/// The producer can decide to `stop` emitting values!
///          => bidirectional!
effect read[A]() : A / stop
```

### Part 1: Write `feed` on `List`s:

Notice that the resume takes a computation now, `read` is a bidirectional effect
(which means that we can call `stop` inside!)

```effekt
def feed[T](list: List[T]) { reader: () => Unit / read[T] } = {
  var l = list
  try {
    reader()
  } with read[T] {
    resume { // resume takes a computation because `read` is bidirectional
      do stop()
      // TODO:
      // Instead of always stopping, stop only if `l` is `Nil()`
      // Otherwise if it's a Cons, set `l` to the tail and return the head
    }
  }
}
```

### Part 2: Write `feed` on `String`s:

```effekt
// Same as above, but for strings.
// Use 'string.length' and 'string.unsafeCharAt(index)'
def feed(string: String) { reader: () => Unit / read[Char] } = {
  var index = 0
  try {
    reader()
  } with read[Char] {
    () // TODO: this time try yourself
  }
}
```

### Intermezzo: a few functions using pull and push streams!

Here are some functions that use `read` (pull streams) and `emit` (push streams).
Take a closer look!
```effekt
/// Reads a positive number from the pull stream.
def readPositive(base: Int): Int / { read[Char], Exception[WrongFormat] } = {
  var res: Int = try char::digitValue(do read()) with stop {
    wrongFormat("Positive number should start with a digit!")
  }

  def go(): Int = try {
    val d = char::digitValue(do read(), base)
    res = res * base + d
    go()
  } with stop {
    res
  } with Exception[WrongFormat] {
    def raise(e, m) = res
  }

  go()
}

/// Runs a `program` until it `stop`s, applying `action` onto every value recieved from `program`.
/// Useful in combination with pull streams.
def untilStopDo[A] { program: () => A / stop } { action: A => Unit }: Unit =
  try {
    def go(): Unit = {
      action(program())
      go()
    }
    go()
  } with stop {
    def stop() = ()
  }

def each[A](list: List[A]): Unit / emit[A] =
  list match {
    case Nil() => ()
    case Cons(head, tail) =>
      do emit(head)
      each(tail)
  }

def each(string: String): Unit / emit[Char] =
  feed(string) {
    untilStopDo[Char] { do read() } { char => do emit(char) }
  }
```

#### Example: parsing

Here's a quick example of `feed` on `String`s, featuring `readPositive`!
```effekt
def example() = {
  with on[WrongFormat].panic

  feed("1111111+99999999") {
    val n = readPositive(10)
    println("n = " ++ n.show)
    // note that this call eats up the `+` as a side effect

    val m = readPositive(10)
    println("m = " ++ m.show)

    println("n + m = " ++ show(n + m))
  }
}
```

### Part 3: What does `source` do?

Try to describe what the following function does and write an example:
You already know `emit` from previous tasks. Feel free to write/copy some functions that use it.
Hint: let the types guide you, take a closer look, hover over things, turn on captures, etc.! `:)`

```effekt
def whatDoesSourceDo(): String = "" // TODO

def sourceExample() = ()

def source[A, R] { stream: () => Unit / emit[A] } { reader: () => R / read[A] }: R = {
  var next = box { None() }
  next = box {
    try {
      stream()
      None()
    } with emit[A] { (v) =>
      next = box { resume(()) }
      Some(v)
    }
  }

  try {
    reader()
  } with read[A] {
    resume {
      next().getOrElse { do stop() }
    }
  }
}
```

### Main and tests

```effekt:repl
testSuite()
```

#### Tests

```effekt
def testSuite(): Unit = suite("tasks/pull") {
  test("feed (list): nonempty exhaustive") {
    var result = []
    feed([1, 2, 3]) {
      untilStopDo { do read[Int] } { v => result = Cons(v, result) }
    }
    assertEqual(result, [3, 2, 1])
  }

  test("feed (list): empty exhaustive") {
    var result = []
    feed(Nil[Int]()) {
      untilStopDo { do read[Int] } { v => result = Cons(v, result) }
    }
    assertEqual(result, [])
  }

  test("feed (list): nonempty non-exhaustive 1") {
    var opt: Option[Int] = None()
    feed([1, 2, 3]) {
      try {
        opt = Some(do read())
      } with stop { () }
    }
    assertEqual(opt, Some(1))
  }

  test("feed (list): nonempty non-exhaustive 2") {
    def getTwo() = {
      val left = do read[Int]()
      val right = do read[Int]()
      (left, right)
    }

    var opt: Option[(Int, Int)] = None()
    feed([10, 20, 100]) {
      try {
        opt = Some(getTwo())
      } with stop { () }
    }
    assertEqual(opt.map { case (l, r) => l + r }, Some(30))
  }

  test("feed (list): empty non-exhaustive") {
    var opt: Option[Int] = None()
    feed(Nil[Int]()) {
      try {
        opt = Some(do read())
      } with stop { () }
    }
    assertEqual(opt, None())
  }

  test("feed (string): 111+222") {
    with on[WrongFormat].panic

    var res = 0
    feed("111+222") {
      val n = readPositive(10)
      val m = readPositive(10)
      res = n + m
    }
    assert(res, 333)
  }
}
```
