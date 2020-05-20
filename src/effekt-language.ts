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

export function load(path: string) {
  let console = { log: self.console.log }
  let require = load

  let module = { exports: null }
  let compiled = Effekt.compileFile(path)
  // console.log(compiled)
  eval("(function() { " + compiled + "}).apply(this)")
  return module.exports
}

export function evaluate(content: string) {
  let console = { log: self.console.log }
  let require = load
  let module = { exports: null }
  let compiled = Effekt.compileString(content)
  eval("(function() { " + compiled + "}).apply(this)")
  let result = module.exports.main().run()
  return result
}