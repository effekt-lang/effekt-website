---
layout: docs
title: Core Concepts
permalink: user-guides/hello-effekt
---

# Hello Effekt!
Effekt have three mode:

- REPL mode
- Interpreter (running the source code as script)
- Compiler, compile effekt

### REPL
Let run repl from console (terminal) by call ``effekt``

```bash
$ effekt             
  _____     ______  __  __     _    _
 (_____)   |  ____|/ _|/ _|   | |  | |
   ___     | |__  | |_| |_ ___| | _| |_
  (___)    |  __| |  _|  _/ _ \ |/ / __|
  _____    | |____| | | ||  __/   <| |_
 (_____)   |______|_| |_| \___|_|\_\\__|

 Welcome to the Effekt interpreter. Enter a top-level definition, or
 an expression to evaluate.

 To print the available commands, enter :help

> "Hello World!"
Hello World!
> 
```

### Running effekt as script
Create a file ``hello.effekt``

```effekt
module hello

def main() = {
   println("Hello world!")
}
```
run it from terminal

```bash
$ effekt hello.effekt
Hello world!
```

### Compile to Javascript
Let us compile ``hello.effekt`` to ``hello.js``

```bash
$ effekt -c hello.effekt
```
This command will create a folder ``out`` and two Javascript files inside the folder.``effekt.js`` is the library for effekt and ``hello.js`` is file to print "Hello World!". 

```javascript
const $effekt = require('./effekt.js')

var $hello = {};

function main() {
    return $effekt.println("Hello world!")
}

return module.exports = Object.assign($hello, { "main": main })
```

Run ``hello.js`` using ``node`` (node.js).

```bash
$ node
Welcome to Node.js v13.12.0.
Type ".help" for more information.
> hello = require('./out/hello.js')
{ main: [Function: main] }
> hello.main().run()
Hello world!
{}
> 
```

### ``;`` as separator not a deliminator
In effekt ``;`` is a separator and not a deliminator. It means when we need to separate expression we can use ``;`` but for the last expression it doesn't need anymore.

**correct**

```effekt
def main() = {
   println("Hello ");
   println("World!")
}
```
When you delete ``;`` after first println expression then it will not compile or error.

**incorrect**

```effekt
def main() = {
   println("Hello ")
   println("World!")
}
```

**Comment**
We can use ``//`` as a expression for comment.

```effekt
def main() = {
   // Comment for hello world
   println("Hello ");
   println("World!")
}
```

**effect program feature**

```bash
$ effekt --help             
  -c, --compile              Compile the Effekt program to JavaScript
      --nocompile            Run the effekt program in the interpreter
      --includes  <arg>...   Path to consider for includes (can be set multiple
                             times)
  -l, --lib  <arg>           Path to the standard library to be used
  -o, --out  <arg>           Path to write generated JavaScript files to
                             (defaults to ./out)
  -s, --server               Run compiler as a language server
      --noserver             Run compiler in standard batch mode
  -h, --help                 Show help message
```
