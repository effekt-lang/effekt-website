---
layout: docs
title: Getting Started
permalink: docs/getting-started
---

# Getting Started

### Installing Effekt
{% include install.md %}

## Your first Effekt Program
Now let's get started. We create a file called `hello.effekt` and fill it
with the following contents:

```
module hello

def main() = {
  println("Hello world!")
}

```
We can execute this example by compiling and running it with effekt.

```bash
$ effekt hello.effekt
Hello world!
```
You can notice that this created a `./out` directory containing the compiled
JavaScript files. We can also run the program (without compiling it again)
by directly using `node`:
```bash
$ node
Welcome to Node.js v13.6.0.
Type ".help" for more information.
> hello = require('./out/hello.js')
{ main: [Function: main] }
> hello.main().run()
Hello world!
```

### Compiling Programs with Effekt
To only compile Effekt sources to JavaScript without running them,
 provide the `--compile` flag. For example:

```
effekt --compile hello.effekt
```
Again, this will generate JavaScript files in `./out`. This output folder can
be configured by providing arguments `--out ./otherdir`.


## Setting Up VSCode
Effekt comes with a basic language server implementation (LSP).
The [effekt-vscode repository](https://github.com/effekt-lang/effekt-vscode)
The extension is currently not published, so you will have to install it
manually by downloading a `vsix` file.
You can download the extension of the latest release on Github:

> <https://github.com/effekt-lang/effekt-vscode/releases/latest>

Then in VSCode select

1. `Preferences / Extensions` in the menu,
2. `...` on the top right corner of the extensions menu, and
3. `Install from VSIX ...` selecting the file you downloaded.

After installing the `vsix` file, you might need to set the path to
the `effekt` binary. For Mac OS and Unix users this probably works out of the
box after installing `effekt` with npm
(that is, once the `effekt` command is in your path). For Windows users, you
might need to double check the path (it defaults to `effekt.cmd`, which can
be found in `%APPDATA%/Roaming/npm`).

With this setup the extension should start the server when an Effekt file is opened.

## Effekt on Windows
If you want to use Effekt with Microsoft's [PowerShell](https://docs.microsoft.com/en-us/powershell/),
there is a few things you need to look out for.

1. The Effekt executable is unsigned at the moment. So running it in PowerShell
   raises an error. You can work around this issue by disabling the check for
   the current sessions. Please be aware that this is a rather drastic
   work around and should be used with care.
   ```
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   This only works for the current session and needs to be repeated every
   time you start a new terminal.

2. Ansi colors are not enabled out of the box. There is a Stackoverflow post
   describing how to enable them. The easiest way is to set `VirtualTerminalLevel`
   in the registry to `true`.
   As always, be careful when tempering with the registry and only do it
   when you know what you are doing!

If you are an experienced Windows user, we are happy to receive your feedback
on how to improve the user experience.

## Recommended Workflow
At the moment, the recommended workflow is to open your files in VSCode and then
run them using the terminal and `effekt path/to/my/file.effekt`.

You can also use the Effekt REPL by omitting the file name:

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

> import examples/hello
> :status
import examples/hello

> main()
Hello world!
()
```
However, currently files are cached and importing them again will not update
them.
