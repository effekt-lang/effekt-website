---
title: Probabilistic
date: 2023-04-19
---

```
import immutable/list


type Probability = Double

effect Flip(p: Probability): Boolean

effect Fail(): Nothing


type Skill {
  Bad();
  Pub();
  Pro()
}

def model() = {

  val peter = uniform([Bad(), Pub(), Pro()]);
  val jessi = uniform([Bad(), Pub(), Pro()]);
  val david = uniform([Bad(), Pub(), Pro()]);

  observe(doesWin(peter, jessi));
  observe(doesWin(jessi, david));

  doesWin(peter, david)
}

def doesWin(player1: Skill, player2: Skill): Boolean / Flip =
  player1 match {
    case Bad() => player2 match {
      case Bad() => do Flip(0.5)
      case Pub() => do Flip(0.3)
      case Pro() => do Flip(0.1)
    }
    case Pub() => player2 match {
      case Bad() => do Flip(0.7)
      case Pub() => do Flip(0.5)
      case Pro() => do Flip(0.3)
    }
    case Pro() => player2 match {
      case Bad() => do Flip(0.9)
      case Pub() => do Flip(0.7)
      case Pro() => do Flip(0.5)
    }
  }

def main() = printDistribution(exactDistribution { model() })



record Weighted[A](a: A, p: Probability)

type Distribution[A] = List[Weighted[A]]


def uniform[A](xs: List[A]): A / { Flip, Fail } =
  xs match {
    case Nil() => do Fail()
    case Cons(y, ys) =>
      if(do Flip(1.0 / toDouble(size(xs)))) {
        y
      } else {
        uniform(ys)
      }
  }

def insertDistribution[A](a: A, p: Probability, xs: Distribution[A]): Distribution[A] =
  xs match {
    case Nil() => [Weighted(a, p)]
    case Cons(Weighted(b, q), ys) => if(a == b) {
      Cons(Weighted(a, p + q), ys)
    } else {
      Cons(Weighted(b, q), insertDistribution[A](a, p, ys))
    }
  }

def unionDistribution[A](xs: Distribution[A], ys: Distribution[A]): Distribution[A] = {
  xs match {
    case Nil() => ys
    case Cons(Weighted(a, p), zs) => unionDistribution(zs, insertDistribution(a, p, ys))
  }
}

def observe(condition: Boolean): Unit / Fail = {
  if(condition) {
    ()
  } else {
    do Fail()
  }
}

def exactDistribution[R] { prog: () => R / { Flip, Fail } }: Distribution[R] / {} = {
  var weight = 1.0;
  try {
    val result = prog();
    Cons(Weighted(result, weight), Nil())
  } with Fail { () =>
    Nil()
  } with Flip { (p) =>
    val before = weight;
    weight = before * p;
    val xs = resume(true);
    weight = before * (1.0 - p);
    val ys = resume(false);
    unionDistribution(xs, ys)
  }
}

def rejectionSampling[R] { prog: () => R / { Flip, Fail } }: R = {
  try {
    prog()
  } with Fail { () =>
    rejectionSampling { prog() }
  } with Flip { (p) =>
    resume(random() < p)
  }
}

def printDistribution[A](disritbution: Distribution[A]): Unit = {
  var mass = 0.0;
  disritbution.map { case Weighted(_, p) => mass = mass + p };
  val normalized = disritbution.map { case Weighted(a, p) => Weighted(a, p / mass) };
  normalized.map { case Weighted(a, p) => println(show(a) ++ ": " ++ show(toInt(100.0 * p)) ++ "%")};
  ()
}
```

