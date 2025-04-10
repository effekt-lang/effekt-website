---
layout: page
title: Playground
section: "quickstart"
position: 2
---

# Interactive Playground

You can immediately experiment with the Effekt language, without [installing](docs/getting-started) it.

Below you can find an editor, which is enabled by clicking "edit" on the right. Please be aware that the changes are not saved unless you create a sharable URL by clicking on the share button.

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

**Warning**: Be sure to inspect any Effekt code that is shared with you before executing it as it is possible to run arbitrary, potentially harmful, JavaScript code.
