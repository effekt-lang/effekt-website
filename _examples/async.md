---
title: Async
date: 2022-09-19
---

# Async

This example was proposed and implemented by [Jack Firth](https://github.com/effekt-lang/effekt/issues/140).
It is a basic implementation of an asynchronous IO system that uses a `Suspend` effect for cooperative multitasking.

```
type Condition = Int

effect Suspend {
  def newCondition(): Condition
  def wait(condition: Condition): Unit
  def signal(condition: Condition): Unit
}

type ThreadStatus[T] {
  Uninitialized();
  Finished(result: T);
  Waiting(condition: Condition);
  Signalling(condition: Condition)
}

def combineAsync[A, B, C] {f: => A / Suspend} {g: => B / Suspend} {combiner: (A, B) => C / Suspend}
    : C / Suspend = {
 var firstComputation = fun() { Uninitialized() }
  firstComputation = fun() {
    try {
      val result = f()
      firstComputation = fun() { Finished(result) }
      Finished(result)
    } with Suspend {
      def newCondition() = resume(do newCondition())
      def wait(condition) = {
        firstComputation = fun() { resume(()) }
        Waiting(condition)
      }
      def signal(condition) = {
        firstComputation = fun() { resume(()) }
        Signalling(condition)
      }
    }
  }
  var secondComputation = fun() { Uninitialized() }
  secondComputation = fun() {
    try {
      val result = g()
      secondComputation = fun() { Finished(result) }
      Finished(result)
    } with Suspend {
      def newCondition() = resume(do newCondition())
      def wait(condition) = {
        secondComputation = fun() { resume(()) }
        Waiting(condition)
      }
      def signal(condition) = {
        secondComputation = fun() { resume(()) }
        Signalling(condition)
      }
    }
  }
  def loop(firstStatus: ThreadStatus[A], secondStatus: ThreadStatus[B]): C / Suspend = {
    (firstStatus, secondStatus) match {
      // These two cases should be impossible because we already assigned these variables.
      case (Uninitialized(), _) => loop(firstComputation(), secondStatus)
      case (_, Uninitialized()) => loop(firstStatus, secondComputation())

      case (Finished(firstResult), Finished(secondResult)) => combiner(firstResult, secondResult)
      case (Finished(_), Waiting(condition)) =>
        do wait(condition)
        loop(firstStatus, secondComputation())
      case (Finished(_), Signalling(condition)) =>
        do signal(condition)
        loop(firstStatus, secondComputation())
      case (Waiting(condition), Finished(_)) =>
        do wait(condition)
        loop(firstComputation(), secondStatus)
      case (Signalling(condition), Finished(_)) =>
        do signal(condition)
        loop(firstComputation(), secondStatus)
      case (Waiting(firstCondition), Waiting(secondCondition)) =>
        do wait(firstCondition)
        do wait(secondCondition)
        loop(firstComputation(), secondComputation())
      case (Signalling(firstCondition), Signalling(secondCondition)) =>
        do signal(firstCondition)
        do signal(secondCondition)
        loop(firstComputation(), secondComputation())
      case (Waiting(waitCondition), Signalling(signalCondition)) =>
        do signal(signalCondition)
        if (waitCondition != signalCondition) {
          do wait(waitCondition)
        }
        loop(firstComputation(), secondComputation())
      case (Signalling(signalCondition), Waiting(waitCondition)) =>
        do signal(signalCondition)
        if (waitCondition != signalCondition) {
          do wait(waitCondition)
        }
        loop(firstComputation(), secondComputation())
    }
  }
  loop(firstComputation(), secondComputation())
}

type ExecutionResult[A] {
  Success(value: A);
  Deadlock(condition: Condition)
}

def execute[A] { f: => A / Suspend }: ExecutionResult[A] = {
  var nextCondition = 0
  try {
    Success(f())
  } with Suspend {
    def newCondition() = {
      val c = nextCondition
      nextCondition = c + 1
      resume(c)
    }
    def wait(condition) = {
      Deadlock(condition)
    }
    def signal(_) = resume(())
  }
}

def main(): ExecutionResult[Unit] / Console = {
  execute {
    val condition = do newCondition()
    def firstThread(): Unit / Suspend = {
      println("First thread sending signal")
      do signal(condition)
      do wait(condition)
      println("First thread received signal")
    }
    def secondThread(): Unit / Suspend = {
      do wait(condition)
      println("Second thread received signal")
      println("Second thread sending signal")
      do signal(condition)
    }
    // These both print out messages in the same order:
    // - First thread sending signal
    // - Second thread received signal
    // - Second thread sending signal
    // - First thread received signal
    println("Starting first thread first")
    combineAsync { firstThread } { secondThread } { (a, b) => () }
    println("Starting second thread first")
    combineAsync { secondThread } { firstThread } { (a, b) => () }
  }
}
```

```effekt:repl
main()
```
