---
title: Comefrom
date: 2023-02-28
---

The `Comefrom` effect.

```
effect Comefrom {
  def label(name: String): Unit
}

def helloWorld(): Unit / Comefrom = {
  do label("0");
  println("Hello");
  do label("1");
  println("World");
  do label("2")
}

def main(): Unit = {
  try {
    helloWorld()
  } with Comefrom {
    def label(name) = {
      println("Came from: " ++ name);
      resume(())
    }
  }
}
```

It is more restrictive than the actual thing because:

1. It shows up in the effect of functions using it
2. Labels have to be explicitly marked
3. It cannot mess with local state

