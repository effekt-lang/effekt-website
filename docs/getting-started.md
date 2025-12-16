---
layout: docs
title: Getting Started
permalink: docs
---

# Getting Started

### Installing Effekt
{% include install.md %}

## Your first Effekt Program
Now let's get started. We create a file called `hello.effekt` and fill it
with the following contents:

```
def main() = {
  println("Hello world!")
}
```
On this page, you can execute the above example, by clicking "run" on the right:
```effekt:repl
main()
```
Feel free to edit the above program and try to run it again.

You can also install Effekt locally and then
execute the example by compiling and running it with effekt.

```bash
$ effekt hello.effekt
Hello world!
```

You can find example programs in the [examples folder]({{ site.githuburl }}/tree/main/examples).


### Compiling Programs with Effekt
Running the above command, you can
notice that this created a `./out` directory containing the compiled
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

To only compile Effekt sources to JavaScript without running them,
 provide the `--compile` flag. For example:

```bash
effekt --compile hello.effekt
```
Again, this will generate JavaScript files in `./out`. This output folder can
be configured by providing arguments `--out ./otherdir`.



## Recommended Workflow
The recommended workflow is to open your files in VSCode and then
run them using the Effekt REPL.
The Effekt REPL is started by just invoking `effekt` (without any arguments):

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

> import hello
> :status
import hello

> main()
Hello world!
()
```
Here, you can define functions, import modules and enter expressions to evaluate.
Executing commands in the REPL compiles the corresponding Effekt-programs
to Javascript (you can find them in `./out/`) and runs them with Node.js.

If you change the contents of the `hello.effekt` file to
```effekt:sketch
module hello

def main() = {
  println("Hello")
}
```
and simply enter `main()` in the open REPL,
you can notice that all necessary dependencies are automatically
recompiled:
```bash
> main()
Hello
()
```

## Setting Up VSCode
Effekt comes with a basic language server implementation (LSP).
The source code for the VSCode extension is available in the [`effekt-vscode` repository](https://github.com/effekt-lang/effekt-vscode).

### Visual Studio Marketplace

You can install the `effekt-lang.effekt` extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=effekt-lang.effekt).

1. Select `Preferences / Extensions` in the menu
2. Type "effekt" in the search bar
3. Click `Install`

Or paste the following command into the VS Code Quick Open menu (Ctrl+P):

> ext install effekt-lang.effekt

### Manual Installation

You can download the extension of the latest release on Github:

> <https://github.com/effekt-lang/effekt-vscode/releases/latest>

In VSCode select

1. `Preferences / Extensions` in the menu,
2. `...` on the top right corner of the extensions menu, and
3. `Install from VSIX ...` selecting the vsix-file.

> #### Note
> After installing the `vsix` file, you might be faced with the error
>
> "Couldn't start client Effekt Language Server"
>
> and need to set the path to the `effekt` binary.
>
> For Mac OS users this probably works out of the box after installing `effekt`
> with npm (that is, once the `effekt` command is in your path). For Windows users,
> you might need to double check the path (it defaults to `effekt.cmd`, which can
> be found in `%APPDATA%/Roaming/npm`). Linux users should point VSCode to the
> `effekt.sh` shell script, located in the npm install path.
>
> You might need to restart VSCode after changing the settings.

With this setup the extension should start the server when an Effekt file is opened.

### Workspace Folder
For the language services to work, you need to open the project's root-folder in VSCode.
In the case of this artifact, the supplementary material folder is the project-folder.
Similarly, we recommend to start the `effekt` command (`effekt.sh` on Linux) in a terminal
in the project's root folder.

## Effekt on Windows
Generally, we recommend using `cmd` at the moment.
If you want to use Effekt with Microsoft's [PowerShell](https://docs.microsoft.com/en-us/powershell/),
there is a few things you need to look out for.

1. The Effekt executable is unsigned at the moment. So running it in PowerShell
   raises an error. You can work around this issue by disabling the check for
   the current sessions. Please be aware that this is a rather drastic
   work around and should be used with care.
   ```bash
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   This only works for the current session and needs to be repeated every
   time you start a new terminal.

2. Ansi colors are not enabled out of the box.
   The easiest way is to set `VirtualTerminalLevel` in the registry to `true`.
   As always, be careful when tempering with the registry and only do it
   when you know what you are doing!

## Effekt on Linux
Instead of using the `effekt` command, on linux for now the shell-script
`effekt.sh` has to be used. It is installed alongside `effekt` using
`npm install ...`.

1. Open the settings of VSCode
2. Search for `effekt`
3. Edit the `Effekt: Executable` property
4. Enter the path to `effekt.sh`, e.g. `/usr/bin/effekt.sh`
5. Restart VSCode
