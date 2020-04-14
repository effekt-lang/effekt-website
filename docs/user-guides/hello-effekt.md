---
layout: docs
title: Core Concepts
permalink: user-guides/hello-effekt
---

# Hello Effekt!
Effekt can run on it's own REPL or compile it to Javascript.
### REPL (Read Evaluate Print Loop)
After installing effekt, let's playing effekt on it's REPL. Call effekt from terminal using ``effekt`` or ``path/to/my/file/effekt``. Welcome messege from effek:

```bash
  _____     ______  __  __     _    _
 (_____)   |  ____|/ _|/ _|   | |  | |
   ___     | |__  | |_| |_ ___| | _| |_
  (___)    |  __| |  _|  _/ _ \ |/ / __|
  _____    | |____| | | ||  __/   <| |_
 (_____)   |______|_| |_| \___|_|\_\\__|

 Welcome to the Effekt interpreter. Enter a top-level definition, or
 an expression to evaluate.

 To print the available commands, enter :help
 
 >
```
**Hello world!** from effekt

```bash
> "Hello World!"
Hello World!
>
```
**Used of repl**

```bash
> :help
<expression>              print the result of evaluating exp
<definition>              add a definition to the REPL context
import <path>             add an import to the REPL context

:status                   show the current REPL environment
:type (:t) <expression>   show the type of an expression
:imports                  list all current imports
:reset                    reset the REPL state
:help (:h)                print this help message
:quit (:q)                quit this REPL
>
```

**Math on repl**

```bash
> 2 + 1
3
> 2020 - 2019
1
> 10 / 5
2
> 100 * 500
50000
>
```
**Variable**

```bash
> val valA = 5
Int
> val valB = 7
Int
> valA + valB
12
>
```
**Function**

```bash
> def max(n: Int, m: Int): Int = if (n > m) n else m
(Int, Int) ==> Int
> max (5, 2)
5
> max (3, 7)
7
```

**Import source code**
Create a new file 'comparison.effekt' [source](comparison.effekt):

```effekt
module comparison

def max(n: Int, m: Int) : Int = 
	if (n > m) 
		n
	else
		m
		
def main() = {
	println(max(12, 17))
}
```
Module name must same with file name, in this case module ``comparison`` and file name ``comparison.effekt``. Every source file must have extension ``.effekt``.

```bash
> import comparison
> :status
import comparison

> :imports
comparison
> main()
17
()
> max(7,12)
12
>
```
Import source file is using `relative path` not `absolute path`. RELP also support working directory ``effekt --includes ./working/directory``.