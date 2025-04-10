---
layout: page
title: Try Effekt Online
section: "quickstart"
position: 2
---

# Try Effekt Online
You can immediately experiment with the Effekt language, without [installing](docs/getting-started) it.

Effekt is a research language, we recommend reading [the papers](https://se.cs.uni-tuebingen.de/research/handlers/effekt/) describing important design decisions and the inner workings of Effekt.

### Online Editor
Below you can find an online editor, which is enabled by clicking "edit" on the right. Please be aware that the changes are not saved!

<pre><code class="language-effekt:prelude:hide">
import list
import option
</code></pre>

<pre><code class="language-effekt" id="playground">
interface Greet { def sayHello(): Unit }

def helloWorld() = try {
  do sayHello()
} with Greet {
  def sayHello() = { println("Hello!"); resume(()) }
}
</code></pre>

<pre><code class="language-effekt:repl" id="repl">
helloWorld()
</code></pre>