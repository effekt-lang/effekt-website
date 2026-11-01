---
layout: docs
title: Getting Started
permalink: docs
---

# Getting Started

This page explains how to install Effekt, run your first program, and start a project.
If you just want to try Effekt without installing it, you can use the [online playground](/playground) or read the [language tour](/tour).

## Installing Effekt
{% include install.md %}

## Your first Effekt Program

Now let's get started. We create a file called `hello.effekt` and fill it with the following contents:

```effekt
def main() = {
  println("Hello world!")
}
```
On this page, you can execute the above example by clicking "run" on the right:
```effekt:repl
main()
```
Feel free to edit the above program and try to run it again.

With Effekt installed, you can also execute the example by compiling and running it with `effekt`.

```bash
$ effekt hello.effekt
Hello world!
```

With the VSCode extension installed and set up, you can click the `▷ Run` button above `main`.

You can find example programs in the [examples folder]({{ site.githuburl }}/tree/main/examples).

### Compiling Programs with Effekt

Running `effekt hello.effekt` created a `./out` directory containing the compiled JavaScript files.

To build a program that you can run again later (without compiling it again), provide the `--build` flag. For example:

```bash
$ effekt --build hello.effekt
$ ./out/hello
Hello world!
```

To only compile Effekt sources to JavaScript without running them, provide the `--compile` flag. For example:

```bash
effekt --compile hello.effekt
```

Again, this will generate JavaScript files in `./out`.
This output folder can be configured by providing arguments `--out ./otherdir`.

### Choosing a Backend

By default, Effekt compiles to JavaScript.

If you want your programs to be faster, you can compile them to native code using the LLVM backend.
Note that the LLVM backend needs Clang and libuv (see [Requirements](#requirements)).

```bash
$ effekt --backend llvm --build hello.effekt
$ ./out/hello
Hello world!
```

Effekt has more backends, for example `--backend chez-cps`.
To see all options and backends, run `effekt --help`.

## Recommended Workflow

The recommended workflow is to open your project in VSCode with the Effekt extension installed and run your program by clicking `▷ Run` above the `main` function.
This runs the file with `effekt` in a terminal inside VSCode.
To use a different backend than JavaScript (see [Choosing a Backend](#choosing-a-backend)), change the `Effekt: Backend` setting.

### Workspace Folder

For the language services to work, you need to open the project's root folder in VSCode.
Similarly, we recommend to start the `effekt` command in a terminal in the project's root folder.

### Using the REPL

To try out definitions and expressions interactively, you can also use the Effekt REPL.
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
Executing commands in the REPL compiles the corresponding Effekt programs to JavaScript (you can find them in `./out/`) and runs them with Node.js.

If you change the contents of the `hello.effekt` file to:

```effekt:sketch
def main() = {
  println("Hello")
}
```
and simply enter `main()` in the open REPL, all necessary dependencies are automatically recompiled:

```bash
> main()
Hello
()
```

## Starting a Project

To start a new project in Effekt, you can use the [effekt-template](https://github.com/jiribenes/effekt-template) repository.
It comes with a main file, tests, and a CI setup that keeps the Effekt version up to date.

1. Open the [effekt-template](https://github.com/jiribenes/effekt-template) repository on Github
2. Click `Use this template`
3. Follow the first steps in its README

## Troubleshooting

### If the Extension Does Not Start

After installing the extension, you might be faced with the following error:

> "Couldn't start client Effekt Language Server"

This means that you need to set the path to the `effekt` binary manually, usually because the `effekt` or `effekt.cmd` commands were not found in your path.

To set the path:

1. Open the settings of VSCode
2. Search for `effekt`
3. Edit the `Effekt: Executable` property and enter the path to the Effekt binary (on Windows, it defaults to `effekt.cmd` which can be found in `%APPDATA%/Roaming/npm` by default)
4. Restart VSCode

### Install Location

If your terminal cannot find the `effekt` command after installing it with npm, please check the install location.
npm installs the `effekt` command into the `bin` folder of its global prefix (on Windows, directly into the prefix folder).
You can find this folder by running:

```bash
npm prefix -g
```

Please note that this folder needs to be included in your `$PATH` environment variable in order to run the `effekt` compiler from the command line.

### Installing the Extension Manually

If you cannot install the extension from the Marketplace, you can download the extension of the latest release on Github:

> <https://github.com/effekt-lang/effekt-vscode/releases/latest>

In VSCode select

1. `Preferences / Extensions` in the menu,
2. `...` on the top right corner of the extensions menu, and
3. `Install from VSIX ...` selecting the vsix-file.

### Effekt on Windows

Generally, we recommend using `cmd` at the moment.
If you want to use Effekt with Microsoft's [PowerShell](https://docs.microsoft.com/en-us/powershell/), there are a few things you need to look out for:

1. The Effekt executable is unsigned at the moment, so running it in PowerShell raises an error.
   You can work around this issue by disabling the check for the current session.
   Please be aware that this is a rather drastic workaround and should be used with care.
   ```bash
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   This only works for the current session and needs to be repeated every time you start a new terminal.

2. ANSI colors are not enabled out of the box.
   The easiest way is to set `VirtualTerminalLevel` in the registry to `true`.
   As always, be careful when tampering with the registry and only do it when you know what you are doing!

## Getting Help

If you run into problems or something does not work as expected, feel free to ask on [Discord]({{ site.discordurl }}) or open an [issue on Github]({{ site.githuburl }}/issues).
