---
title: Region-based memory
date: 2024-06-15
---

# Region-based memory

This example illustrates how Effekt also applies the same mechanism (distinguishing first from second-class resources)
to region-based memory.
```
import immutable/list

def main() = {

  region r {
    var sum in r = 0 // this allocates into the region r

    // Try hovering over `foreach` to see its signature
    // Notice that we can "just" use sum without it showing
    // up in the types
    [1, 2, 3].foreach { n => sum = sum + n }

    // Creating a first class function that closes over sum requires 
    // r to show up in its type.
    // Hovering over f shows the type: 
    //   () => Unit at {r, io}
    // 
    // Here io is mentioned because we use println.
    val f = box { println(sum) }

    f()

    // try returning f here:
    // f
  }
}
```

```effekt:repl
main()
```
