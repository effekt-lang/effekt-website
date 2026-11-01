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
This will download the compiler and install the `effekt` binary as a command usable in your terminal.

### Install location

npm installs the `effekt` command into the `bin` folder of its global prefix (on Windows, directly into the prefix folder).
You can find this folder by running:

```bash
npm prefix -g
```

Please note that this folder needs to be included in your `$PATH` environment variable in order to run the `effekt` compiler from the command line.

### Try without installing

If you just want to try Effekt, you can also run it with `npx`, which comes with npm:
```bash
npx @effekt-lang/effekt
```
This downloads the compiler on first use and starts the Effekt REPL.
Note that you still need Java and Node.js, and that the VSCode extension cannot use Effekt from `npx`.

### Install with Nix

If you are using [Nix](https://nixos.org), you can also install Effekt via [effekt-nix](https://github.com/jiribenes/effekt-nix), also used by the [community projects]({{ site.communityurl }}).

To try Effekt via Nix without installing it, run:
```bash
nix run github:jiribenes/effekt-nix
```
To install Effekt, run:
```bash
nix profile install github:jiribenes/effekt-nix
```
Note that if your npm comes from Nix, the VSCode extension cannot install Effekt for you, so please use effekt-nix instead.
For more ways to use effekt-nix, for example development shells or specific versions, see its [README](https://github.com/jiribenes/effekt-nix).

### Install specific release

To install a specific version with npm, run:
```bash
npm install -g @effekt-lang/effekt@<VERSION>
```

You can find all releases on the [release page on Github]({{ site.githuburl }}/releases).
Each release also comes with an `effekt.tgz` file, which you can install manually by running:
```bash
npm install -g <PATH_TO_FILE>/effekt.tgz
```

### Uninstalling

You can always remove the Effekt installation by:
```bash
npm remove -g @effekt-lang/effekt
```
