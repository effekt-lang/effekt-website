---
title: Sieve
date: 2022-08-25
---

# Sieve of Eratosthenes

Based on <https://www.cs.hmc.edu/~oneill/papers/Sieve-JFP.pdf>

```
import list

interface EmitPrime {
  def emitPrime(prime: Int): Unit
}

interface PriorityQueue[A] {
  def insertKeyValue(key: Int, value: A): Unit
  def minimumKeyValue(): (Int, A)
  def replaceKeyValue(key: Int, value: A): Unit
}

def withNaivePriorityQueue[A, R] { prog: () => R / PriorityQueue[A] } = {
  var priorityQueue = Nil[(Int, A)]();
  def insert(k: Int, v: A, q: List[(Int, A)]): List[(Int, A)] = {
    q match {
      case Nil() => [(k, v)]
      case Cons((k1, v1), rest) =>
        if(k > k1) {
          Cons((k1, v1), insert(k, v, rest))
        } else {
          Cons((k, v), q)
        }
    }
  }
  try {
    prog()
  } with PriorityQueue[A] {
    def insertKeyValue(k, v) = {
      priorityQueue = insert(k, v, priorityQueue);
      resume(())
    }
    def minimumKeyValue() = {
      priorityQueue match {
        case Nil() => <>
        case Cons((k, v), _) => resume((k, v))
      }
    }
    def replaceKeyValue(k, v) = {
      priorityQueue match {
        case Nil() => <>
        case Cons(_, rest) =>
          priorityQueue = insert(k, v, rest);
          resume(())
      }
    }
  }
}

def moveComposites(currentCandidate: Int): Unit / PriorityQueue[Int] = {
  val (nextComposite, increment) = do minimumKeyValue[Int]();
  if(currentCandidate == nextComposite) {
    do replaceKeyValue(nextComposite + increment, increment);
    moveComposites(currentCandidate)
  } else {
    ()
  }
}

def insertPrime(prime: Int) = {
  do insertKeyValue(prime + prime, prime)
}

def sieve(): Unit / {EmitPrime, PriorityQueue[Int]} = {
  def loop(currentCandidate: Int): Unit = {
    val (nextComposite, _) = do minimumKeyValue[Int]();
    if(currentCandidate == nextComposite) {
      moveComposites(currentCandidate);
      loop(currentCandidate + 1)
    } else {
      do emitPrime(currentCandidate);
      insertPrime(currentCandidate);
      loop(currentCandidate + 1)
    }
  };
  do emitPrime(2);
  insertPrime(2);
  loop(3)
}

def example() = {
  var numberOfPrimes = 10;
  try {
    withNaivePriorityQueue[Int, Unit] {
      sieve()
    }
  } with EmitPrime {
    def emitPrime(prime) = {
      if(numberOfPrimes > 0) {
        println(prime);
        numberOfPrimes = numberOfPrimes - 1;
        resume(())
      }
    }
  }
}
```

```effekt:repl
example()
```
