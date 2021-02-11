---
layout: docs
title: Core Concepts
permalink: user-guides/getting-started
---

# Getting Started
### Requirement
Currently, the Effekt language is implemented in Scala and compiles to JavaScript. To use the Effekt compiler and run the resulting programs, you need this to program to install in your computer:

- Java (>= 1.8)
- [Node.js](https://nodejs.org/en/) (>= 10)
- [npm](https://www.npmjs.com)

### Download and Install
The recommed way to install Effekt is by running:

```
npm install -g https://github.com/effekt-lang/effekt/releases/latest/download/effekt.tgz
```

This will download the compiler and install the `effekt` command in your path.

Alternatively, you can also download a specific release on the
[release page on Github](https://github.com/effekt-lang/effekt/releases).

And then install it with
```
npm install -g <PATH_TO_FILE>/effekt.tgz
```

### On Windows system
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
