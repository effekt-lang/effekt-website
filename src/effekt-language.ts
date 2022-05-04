/**
 * The (conceptual) webworker.
 *
 * Right now, we are not implementing it as a webworker, but with a synchronous API.
 * The API also is using vscode-types since the Effekt language server implements LSP
 */
import { effekt } from "./effekt";
import type { Diagnostic, Position } from "vscode-languageserver-types"

let Effekt = effekt.LanguageServer()

export function typecheck(filename: string): Diagnostic[] {
  return Effekt.typecheck(filename)
}

export function write(filename: string, content: string): void {
  Effekt.writeFile(filename, content)
}

export function infoAt(filename: string, position: Position): string {
  return Effekt.infoAt(filename, position)
}

export function evalModule(contents: string) {
  let console = { log: self.console.log }
  let require = load
  let module = { exports: null }

  eval("(function() { " + contents + "}).apply(this)")

  return module.exports
}

// Evaluate should eval each module ONCE and then store in field modules.
// Load should just look them up.
let loadedModules = {
  "examplefile.js": {
    module: null,
    timestamp: 12345677
  }
}
export function load(path: string) {
  const mod = loadedModules[path] || { module: null, timestamp: 0 };
  loadedModules[path] = mod;
  const fullpath = "out/" + path;
  const lastModified = Effekt.lastModified(fullpath);
  if (lastModified > mod.timestamp) {
    const contents = Effekt.readFile(fullpath)
    mod.module = evalModule(contents)
    mod.timestamp = lastModified
    return mod.module
  } else {
    return mod.module
  }

}

export function evaluate(content: string) {
  write("interactive.effekt", content)
  const mainFile = Effekt.compileFile("interactive.effekt")
  return load(mainFile.replace(/^(out\/)/,"")).main().run()
}