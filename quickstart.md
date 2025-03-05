---
layout: page
title: Try Effekt Online
section: "quickstart"
position: 2
---

# Try Effekt Online
You can immediately experiment with the Effekt language, without [installing](docs) it.

Effekt is a research language, we recommend reading [the papers](https://se.cs.uni-tuebingen.de/research/handlers/effekt/) describing important design decisions and the inner workings of Effekt.

### Online Editor
Below you can find an online editor, which is enabled by clicking "edit" on the right. Please be aware that the changes are not saved!

```effekt:prelude:hide
import list
import option
```

```
interface Greet { def sayHello(): Unit }

def helloWorld() = try {
  do sayHello()
} with Greet {
  def sayHello() = { println("Hello!"); resume(()) }
}
```

### REPL
The following read-eval-print-loop gives you access to run the above contents:
```effekt:repl
helloWorld()
```
