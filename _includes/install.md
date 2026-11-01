### Requirements

Currently, the Effekt language is implemented in Scala and compiles to JavaScript (besides other backends).
To use the Effekt compiler and run the resulting programs, you need to have

- Java (>= 17),
- [Node.js](https://nodejs.org/en/) (>= 16), and
- [npm](https://www.npmjs.com)

installed.

If you want to use the LLVM backend, you also need to have [Clang](https://clang.llvm.org) and [libuv](https://libuv.org) installed (see [Choosing a Backend](#choosing-a-backend) below).

### Install with VSCode

We recommend using [VSCode](https://code.visualstudio.com) with the Effekt extension, which can also install Effekt for you.

Install the extension by its exact ID, `effekt-lang.effekt`.
Please use one of these ways to do so:

- Open [`effekt-lang.effekt` in the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=effekt-lang.effekt) and click `Install`
- Paste `ext install effekt-lang.effekt` into the VSCode "Quick Open" menu (`Ctrl+P` or `Cmd+P`) and press `Enter`
- Run `code --install-extension effekt-lang.effekt` in a terminal
- Search for `effekt-lang.effekt` in the Extensions view of VSCode and click `Install`

Please double-check that the publisher is "Effekt Language" with a blue verified badge for the `effekt-lang.org` domain before you install.

After installing the extension:

1. Open a file that ends in `.effekt`
2. When the extension asks whether you want to install Effekt, click `Yes`

This works in most cases, but not always (especially on Windows).
If it does not work for you, please install Effekt [with npm](#install-with-npm) instead.

The extension also lets you know when a new version of Effekt is available.
You can check for updates at any time by clicking on `Ξ Effekt` in the status bar.
For more information on VSCode, see [Setting Up VSCode](#setting-up-vscode) below.

### Install with npm

To install the latest release with npm, run:
```bash
npm install -g @effekt-lang/effekt
```
This will download the compiler and install the `effekt` command.

### Install specific release

Alternatively, you can also download a specific release on the
[release page on Github]({{ site.githuburl }}/releases).
And then install it with
```bash
npm install -g <PATH_TO_FILE>/effekt.tgz
```

### Install location

npm installs the `effekt` command into the `bin` folder of its global prefix
(on Windows, directly into the prefix folder).
You can find this folder by running:

```bash
npm prefix -g
```

Please note that this folder needs to be included in your `$PATH` environment variable in order to run the `effekt` compiler from the command line.

For example, depending on your configuration, on Mac OSX the `effekt` command will be placed in:
```bash
/usr/local/bin
```

### Uninstalling

You can always remove the Effekt installation by:
```bash
npm remove -g @effekt-lang/effekt
```

> #### Note
> The Effekt "binary" is actually just an executable jar-file. 
> On Windows, NPM will also install an `effekt.cmd` script to start the jar-file with `java -jar`.
