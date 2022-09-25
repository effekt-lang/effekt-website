---
layout: page
title: Contributing
section: contributing
position: 4
---

# How to Contribute
Yay, we are happy that you want to contribute to the language. Here is how
you get started:

## Building Effekt
While this document might age and become outdated, the most current and up-to-date
instructions can always be found in the [Github Actions workflow file]({{ site.githuburl }}/blob/master/.github/workflows/ci.yml).
It might be a bit tricky to read but does contain all the necessary information.

If you notice that something does not work as expected, please consider
opening an [issue]({{ site.githuburl }}/issues). Also feel free to update this
page on [Github]({{ site.githuburl_website }}/blob/master/contributing.md)
and subsequently open a pull request.

### Software Requirements
You need to have the following software installed to build and use Effekt:

- git
- JDK >= 1.8 and [Maven](https://maven.apache.org/)
- sbt (<https://www.scala-sbt.org>)
- npm (to package and install the Effekt compiler)
- (Maven -- only for creating releases)

Depending on the backend you want to use / work on, you also need:
- *JS backend (default)*: Node.js (>= 10) and npm
- *Chez-Scheme backend*: [Chez Scheme](https://github.com/cisco/ChezScheme)
- *LLVM backend (wip)*: LLVM > 12 and gcc

Why three package management tools? The main build tool we use is sbt,
but we use Maven to extract dependencies and aggregate license files of the
library dependencies. Finally, we use npm simply as a way to deploy the
language as an npm package.

### Compiling the Effekt Compiler
Great that you have made it this far! We can now finally compile the Effekt
project. To do so, first clone the repository as well as all of its submodule
dependencies:
```bash
$ git clone --recurse-submodules git@github.com:effekt-lang/effekt.git
```
> Note: We recommend you to use the following
> [git config](https://git-scm.com/docs/git-config#Documentation/git-config.txt-submodulerecurse)
> that will always keep the submodules in sync with the current branch that you
> are working on:
> ```bash
> git config --global submodule.recurse true
> ```
> If despite your best efforts the submodule still resides in an undesirable
> state, you can always nuke it: `$ rm -rf kiama/ && git submodule update`

Inside the repository's root, enter an `sbt` shell, select your platform of
choice and run all unit tests to verify your setup:
```bash
$ cd effekt
$ sbt
sbt:root> project effektJVM
sbt:effekt> test
...
```
Ignoring a handful of spurious warnings, a wall of green text should indicate
all tests passing.

As mentioned before, the Effekt compiler can be run as a Java program, but
also as a JavaScript program. Hence, we need a slightly complicated
[Cross-build setup](https://www.scala-js.org/doc/project/cross-build.html)
with two projects: `effektJVM` and `effektJS`.

### Locally Installing your Compiler Build
The easiest way to install your version of Effekt is by running
```bash
$ sbt
sbt:root> project effektJVM
sbt:effekt> install
...
```
Please note that this also requires `mvn` to generate license files.

### Generating the Effekt Binary
The Effekt binary is actually just a simple wrapper that invokes `java -jar effekt.jar`.
To generate the jar file and assemble everything simply run:
```bash
$ sbt deploy
```
Afterwards, you can find the `effekt.jar` in the `bin/` directory.

### Working on the "Standard Library"
The Effekt standard library is still in its infancy. If you want to work on
it, we recommend the following workflow: Check out the effekt repository
and start the repl in the project directory. This will enable using the
library in folder `lib` instead of the bundled one.

You can now go ahead and create a test file in `examples` that uses
your new / improved library module, like
```effekt:sketch
module examples/mynewmoduletester

import io/mynewmodule

def main() = mynewfunction()
```

This makes sure that you are always interacting with the most up-to-date version
of the standard library you are currently working on.
