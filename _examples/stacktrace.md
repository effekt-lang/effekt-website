---
title: Stacktraces
date: 2023-04-28
---

# Stacktraces

This example illustrates user defined stack traces.

```
record SourcePosition(filepath: String, line: Int, column: Int)
record TraceFrame(position: Option[SourcePosition], description: String)
type Stacktrace = List[TraceFrame]

effect Exception[E] {
  def raise(exception: E, msg: String, trace: Stacktrace): Nothing
}
record RuntimeError()

def raise[A](msg: String): A / Exception[RuntimeError] = do raise(RuntimeError(), msg, Nil()) match {}
def raise[A, E](exception: E, msg: String): A / Exception[E] = do raise(exception, msg, Nil()) match {}

// converts exceptions of (static) type E to an uncatchable panic that aborts the program
def panicOn[E] { prog: => Unit / Exception[E] }: Unit =
  try { prog() } with Exception[E] { def raise(exception, msg, trace) = panic(msg) }

// reports exceptions of (static) type E to the console
def report[E] { prog: => Unit / Exception[E] }: Unit =
  try { prog() } with Exception[E] { def raise(exception, msg, trace) = println(msg) }

// ignores exceptions of (static) type E
def ignoring[E] { prog: => Unit / Exception[E] }: Unit =
  try { prog() } with Exception[E] { def raise(exception, msg, trace) = () }

def trace[R, E](description: String) { prog: => R / Exception[E] } =
  try { prog() }
  with Exception[E] {
    def raise(exception, msg, trace) = do raise(exception, msg, Cons(TraceFrame(None(), description), trace))
  }

def printStacktrace(trace: Stacktrace): Unit = trace match {
  case Nil() => ()
  case Cons(TraceFrame(pos, desc), rest) =>
    println("  " ++ desc);
    printStacktrace(rest)
}

def bar(n: Int): Int / Exception[RuntimeError] = {
  with trace[Int, RuntimeError]("function bar()");
  if (n == 0) raise("boom!") else bar(n - 1)
}

def foo() = {
  with trace[Int, RuntimeError]("function foo()");
  bar(5)
}


def main() =
 try {
  foo(); ()
} with Exception[RuntimeError] {
  def raise(_, msg, trace) = {
    println("Runtime Exception: " ++ msg);
    printStacktrace(trace)
  }
}
```

```effekt:repl
main()
```
