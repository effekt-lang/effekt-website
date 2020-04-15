---
layout: docs
title: Core Concepts
permalink: user-guides/variable
---

# Variable
Since Effekt is hybrid programming language like scala programming language, effekt also support mutable and immutable variable. To create mutable, we can use ``var`` as keyword and ``val`` for immutable variable.

**Mutable**
``var mutVar = 6``

**Immutable**
``val immutVar = 7``

Immutable means we can't bind it to another value after on. For example, when we bind a value to a variable x like ``val x = 3`` and on the next line code we change it to ``x = 5`` then effekt will show error because it is a immutable variable.  On the other hand, mutable means we can bind it to another value anytime we need.

**example** (variable.effekt)

```effekt
module variables

def main() = {
  //  Immutable variable
  val immutableValue = 5;
  println("Immuable");
  println(immutableValue);
  // Mutable variable
  println("Mutable");
  var mutVar = 1;
  while(mutVar < 10){
    println(mutVar);
    mutVar = mutVar + 1
  }
}
```

**Output - running as script**

```bash
Immuable
5
Mutable
1
2
3
4
5
6
7
8
9
```
**Output - compile to Javascript**

```javascript
const $effekt = require('./effekt.js')

var $variables = {};

function main() {
    return $effekt.pure(5).then((immutableValue) =>
        $effekt.println("Immuable").then(() =>
            $effekt.println(immutableValue).then(() =>
                $effekt.println("Mutable").then(() =>
                    $effekt.pure(1).state((mutVar) =>
                        $effekt._while(() =>
                            $effekt.pure($effekt.infixLt(mutVar.value(), 10)), () =>
                            $effekt.println(mutVar.value()).then(() =>
                                $effekt.pure(mutVar.value($effekt.infixAdd(mutVar.value(), 1))))))))))
}

return module.exports = Object.assign($variables, { "main": main })
```

**Output - run javascript ``variables.js``**

```javascript
Welcome to Node.js v13.12.0.
Type ".help" for more information.
> variable = require('./out/variables.js')
{ main: [Function: main] }
> variable.main().run()
Immuable
5
Mutable
1
2
3
4
5
6
7
8
9
null
> 
```