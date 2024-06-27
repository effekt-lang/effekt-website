Currently, the Effekt language is implemented in Scala and compiles to JavaScript (besides other backends).
To use the Effekt compiler and run the resulting programs, you need to have

- Java (>= 11),
- [Node.js](https://nodejs.org/en/) (>= 12), and
- [npm](https://www.npmjs.com)

installed.

The recommended way to install Effekt is by running:
```bash
npm install -g https://github.com/effekt-lang/effekt/releases/latest/download/effekt.tgz
```
This will download the compiler and install the `effekt` command in your path.

Alternatively, you can also download a specific release on the
[release page on Github]({{ site.githuburl }}/releases).
And then install it with
```bash
npm install -g <PATH_TO_FILE>/effekt.tgz
```

You can find the installation location by running

```bash
npm root -g
```
For example, on Mac OSX the effekt binary will be placed in:
```bash
/usr/local/lib/node_modules/effekt/bin
```

You can always remove the effekt installation by:
```bash
npm remove -g effekt
```

> #### Note
> The Effekt "binary" is actually just an executable jar-file. NPM will
> also install scripts (`effekt.sh` on Linux) and (`effekt.cmd` on Windows) to
> start the jar-file with `java -jar`.
