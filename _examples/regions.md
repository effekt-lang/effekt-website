---
title: Regions
date: 2022-08-18
---

# Regions

Simple example that shows the new region feature.

```
def user {r: Region} = {
  var x in r = 1;
  x = x + 1
}

def ex() = region myRegion {
  user {myRegion}
}
```

```effekt:repl
ex()
```
