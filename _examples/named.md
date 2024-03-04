---
title: Multiple Named Handlers
date: 2024-03-04
---

# Multiple Named Handlers

This example illustrates how Effekt supports multiple instances of the same effect. Due to the capability-passing style translation, this is quite natural and comes for free.

```
interface Cell { 
  def get(): Int
  def set(n: Int): Unit 
}

def add {c1: Cell} {c2: Cell} {dst: Cell} = 
  dst.set(c1.get + c2.get)

def fresh[T](init: Int) { prog: {Cell} => T }: T = {
  var contents: Int = init;
  try { prog {c} } with c: Cell { 
    def get() = resume(contents)
    def set(n) = { contents = n; resume(()) }
  }
}

def main() = {
  fresh(0) { {target: Cell} =>
    fresh(0) { {c1: Cell} =>
      fresh(0) { {c2: Cell} =>
        c1.set(1);
        c2.set(2);
        add {c1} {c2} {target};
        println(target.get)
      }
    }
  }
}
```

```effekt:repl
main()
```
