#### Requirements

Currently, the Effekt language is implemented in Scala and compiles to JavaScript (besides other backends).
To use the Effekt compiler and run the resulting programs, you need to have

- Java (>= 17),
- [Node.js](https://nodejs.org/en/) (>= 16), and
- [npm](https://www.npmjs.com)

installed.

#### Install latest release

The recommended way to install Effekt is by running:
```bash
npm install -g @effekt-lang/effekt
```
This will download the compiler and install the `effekt` command to `npm root -g`.

#### Install specific release

Alternatively, you can also download a specific release on the
[release page on Github]({{ site.githuburl }}/releases).
And then install it with
```bash
npm install -g <PATH_TO_FILE>/effekt.tgz
```

#### Install location

You can find the installation location by running

```bash
npm root -g
```

Please note that this directory needs to be included in your `$PATH` environment variable in order to run the `effekt` compiler from the command line.

For example, depending on you configuration, on Mac OSX the `effekt` binary will be placed in:
```bash
/usr/local/lib/node_modules/effekt/bin
```

#### Uninstalling

You can always remove the Effekt installation by:
```bash
npm remove -g effekt
```

> #### Note
> The Effekt "binary" is actually just an executable jar-file. NPM will
> also install scripts (`effekt.sh` on Linux) and (`effekt.cmd` on Windows) to
> start the jar-file with `java -jar`.
