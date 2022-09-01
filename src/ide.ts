/**
 * The (conceptual) webworker.
 *
 * The API is using vscode-types since the Effekt language server implements LSP
 */
import * as effekt from "./effekt-language";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import type { Diagnostic, DiagnosticSeverity, Position } from "vscode-languageserver-types"

// initialize:
// load all code[module=...] elements and write them to the IDE
document.querySelectorAll("code[module]").forEach( (code: HTMLElement) => {
  let module = code.getAttribute("module")
  let filename = module + ".effekt"
  let content = code.getAttribute("prelude") + code.getAttribute("content") + code.getAttribute("postlude")
  effekt.write(filename, content)
})

export interface IViewModel extends monaco.editor.ITextModel {
  getFullText(): string
  modelPosition(pos: Position): Position
  viewPosition(pos: Position): Position
}

export function createModel(filename: string, contents: string, hiddenPrelude: string, hiddenPostlude: string): IViewModel {
  let model = monaco.editor.createModel(contents.trim(), "effekt", monaco.Uri.file(filename))
  let pre = hiddenPrelude || ""
  let post = hiddenPostlude || ""
  let lineOffset = (hiddenPrelude.match(/\n/g) || '').length
  //@ts-ignore
  model.getFullText = function() {
    return pre + model.getValue() + post
  }
  //@ts-ignore
  model.modelPosition = function (viewPos: Position): Position {
    viewPos = viewPos || { line: 0, character: 0 }
    return { line: (viewPos.line || 0) + lineOffset, character: viewPos.character || 0 }
  }
  //@ts-ignore
  model.viewPosition = function (modelPos: Position): Position {
    modelPos = modelPos || { line: 0, character: 0 }
    return { line: (modelPos.line || 0) - lineOffset, character: modelPos.character || 0 }
  }
  //@ts-ignore
  return model
}

export function typecheck(model: IViewModel) {
  updateModel(model)
  var diagnostics = effekt.typecheck(filename(model.uri)).map( (d: Diagnostic) => {
    d.range.start = model.viewPosition(d.range.start)
    d.range.end = model.viewPosition(d.range.end)
    return convertDiagnostics(d)
  })
  monaco.editor.setModelMarkers(model, "effekt", diagnostics);
}

export function showCore(model: IViewModel) {
  updateModel(model)
  return effekt.showCore(filename(model.uri))
}

export function showLiftedCore(model: IViewModel) {
  updateModel(model)
  return effekt.showLiftedCore(filename(model.uri))
}

export function updateModel(model: IViewModel) {
  writeFile(filename(model.uri), model.getFullText())
}

export function writeFile(path: string, content: string) {
  effekt.write(path, content)
}

export function evaluate(content: string) {
  return effekt.evaluate(content)
}

export const hoverProvider = {
  provideHover: function(model, position, token) {
    const m = model as IViewModel
    const info: string = effekt.infoAt(filename(model.uri), m.modelPosition(toLspPosition(position)))
    if (info) {
      return { contents: [{ value: info }] }
    } else {
      return null
    }
  }
}

// extracts the path and drops the leading /
function filename(uri: monaco.Uri): string {
  return uri.path.substring(1)
}


// Monaco vs LSP

function convertDiagnostics(d: Diagnostic): monaco.editor.IMarkerData {
  return {
    startLineNumber: (d.range.start.line || 0) + 1,
    startColumn: (d.range.start.character || 0) + 1,
    endLineNumber: (d.range.end.line || 0) + 1,
    endColumn: (d.range.end.character || 0) + 1,
    severity: convertSeverity(d.severity),
    message: d.message
  };
}

function toLspPosition(position: monaco.Position): Position {
  return { line: position.lineNumber - 1, character: position.column - 1 }
}


function convertSeverity(lspSeverity: DiagnosticSeverity): monaco.MarkerSeverity {
  switch (lspSeverity) {
    case 1: return monaco.MarkerSeverity.Error
    case 2: return monaco.MarkerSeverity.Warning
    case 3: return monaco.MarkerSeverity.Info
    case 4: return monaco.MarkerSeverity.Hint
  }
}
