---
title: Push Pull Streams
date: 2022-08-19
---

# Connecting a push stream and a pull stream

In
[Effects, Capabilities, and Boxes](https://se.cs.uni-tuebingen.de/publications/brachthaeuser22effects/)
we make it possible (among other things) to store computations in mutable
references. Here we store a function in the mutable reference `coroutine` that
when called will run `iterator` until the next yield and then update itself with
the resumption. The innocent-looking line `resume(coroutine())` reads the
current function from `coroutine`, unboxes it, calls it, and resumes with the
result. If you hover over `coroutine` you will see that the value stored there
is of type `() => Option[A] at {iterator, this}`. The function closes over
`iterator` and the mutable reference itself, which lives in `this`.

```
type Option[A] {
  Present(value: A);
  Absent()
}

effect Iterate[A] {
  def yield(element: A): Unit
}

effect Reduce[A] {
  def receive(): Option[A]
}

def inRange(start: Int, end: Int): Unit / Iterate[Int] = {
  do yield(start);
  if (start != end) inRange(start + 1, end);
}

def intoFold[A, S](initState: S) { f: (S, A) => S } : S / Reduce[A] =
  do receive[A]() match {
    case Present(a) => intoFold(f(initState, a)) { (s, a) => f(s, a) }
    case Absent() => initState
  }

def intoSum(): Int / Reduce[Int] = intoFold(0) { (s, a) => s + a }

def reduce[A, B]() { iterator: () => Unit / Iterate[A] } { reducer: () => B / Reduce[A] } = {
  var coroutine = fun() { Absent() };
  coroutine = fun() {
    try {
      iterator();
      Absent()
    } with Iterate[A] {
      def yield(e) = {
        coroutine = fun() { resume(()) };
        Present(e)
      }
    }
  };
  try {
    reducer()
  } with Reduce[A] {
    def receive() = {
      resume(coroutine())
    }
  }
}

def main() = {
  reduce[Int,Int]() { inRange(0, 5) } { intoSum() }
}
```

```effekt:repl
main()
```
