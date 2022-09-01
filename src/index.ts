import * as hljs from "./highlight-effekt";
import * as docs from "./docs";

async function enableEditing(code: HTMLElement, run: HTMLElement, coreOut: HTMLElement, liftedOut: HTMLElement) {
    let parent = code.parentNode as HTMLElement

    parent.classList.add("editor-loading")

    let IDE = await import(/* webpackMode: "lazy", webpackChunkName: "ide" */ "./ide")
    let editor = await import(/* webpackMode: "lazy", webpackChunkName: "editor" */ "./editor")

    parent.classList.remove("editor-loading")
    parent.classList.add("editor")

    const module: string = code.attributes["module"].value
    const filename = module + ".effekt"
    const contents = code.attributes["content"].value
    code.textContent = ""

    let prelude = code.attributes["prelude"].value || ""
    let postlude = code.attributes["postlude"].value || "\n"

    // we create a model, initialized with the contents
    const model = IDE.createModel(filename, contents, prelude, postlude)
    IDE.updateModel(model)
    model.onDidChangeContent(e => { IDE.updateModel(model) })

    let output: HTMLElement;
    if (run) {
      output = document.createElement("ul")
      output.classList.add("repl-output")
      parent.insertAdjacentElement("afterend", output)
    }

    // init editor
    editor.create(code, run, output, coreOut, liftedOut, model)
}


function processCode() {
  let fences: NodeListOf<HTMLElement> = document.querySelectorAll("pre > code")

  let id = 0;
  let prelude = ""

  function addMetadata(code: HTMLElement, opts: CodeOptions) {
    let moduleName = "module" + id++
    code.setAttribute("module", moduleName)
    const moduleDecl = "module " + moduleName + "\n"

    let parent: HTMLElement = code.parentElement

    // do not add repls to prelude
    if (opts.repl) {
      parent.classList.add("repl")
      code.setAttribute("prelude", moduleDecl + prelude + "\ndef main() = println(\n")
      code.setAttribute("content", code.textContent)
      code.setAttribute("postlude", "\n)\n")
    } else {
      let pre = moduleDecl + prelude
      let post = "\n"
      code.setAttribute("prelude", pre)
      code.setAttribute("postlude", post)
      code.setAttribute("content", code.textContent)

      if (!opts.ignore) {
        prelude = prelude + "import " + moduleName + "\n"
      }
    }
  }

  function addNavigation(code: HTMLElement, opts: CodeOptions) {
    let parent = code.parentNode.parentNode as HTMLElement

    const nav = document.createElement("nav")

    nav.classList.add("code-menu")

    let coreOut: HTMLElement;
    if (opts.core) {
      coreOut = document.createElement("code")
      coreOut.innerHTML = "// Please click 'edit' to show generated core."

      let container = document.createElement("div")
      container.classList.add("core-out")

      let headline = document.createElement("h4")
      headline.innerHTML = "Generated Core"
      container.appendChild(headline)

      let pre = document.createElement("pre")
      pre.append(coreOut)
      container.appendChild(pre)

      parent.insertBefore(container, code.parentNode.nextSibling)
    }

    let liftedCore: HTMLElement;
    if (opts.lifted) {
      liftedCore = document.createElement("code")
      liftedCore.innerHTML = "// Please click 'edit' to show generated lifted core."

      let container = document.createElement("div")
      container.classList.add("core-out")

      let headline = document.createElement("h4")
      headline.innerHTML = "Generated Lifted Core"
      container.appendChild(headline)

      let pre = document.createElement("pre")
      pre.append(liftedCore)
      container.appendChild(pre)

      parent.insertBefore(container, code.parentNode.nextSibling)
    }

    if (opts.repl) {
      let run = document.createElement("a")
      run.setAttribute("href", "#")
      run.classList.add("button-run")
      run.textContent = "run"
      nav.append(run)

      run.onclick = () => {
        enableEditing(code, run, coreOut, liftedCore);
        return false
      }

    } else if (!opts.readOnly) {
      let edit = document.createElement("a")
      edit.setAttribute("href", "#")
      edit.classList.add("button-edit")
      edit.textContent = "edit"
      nav.append(edit)

      let activateEditor = () => {
        edit.onclick = () => { return false }
        edit.classList.add("disabled");
        enableEditing(code, null, coreOut, liftedCore);
        return false
      }
      edit.onclick = activateEditor
    }
    code.parentNode.prepend(nav)
  }

  fences.forEach(code => {

    let opts = classToOptions(code)

    if (opts.reset) {
      prelude = ""
    }

    if (opts.hidden) {
      code.classList.add('hidden')
      code.parentElement.classList.add('hidden')
    }

    if (opts.language != "effekt") return;

    if (opts.repl) { code.classList.add('repl') }

    if (opts.prelude) {
      prelude = prelude + code.textContent
    }

    // only apply syntax highlighting
    if (opts.prelude || opts.sketch) {
      // nothing right now. Maybe add a class to indicate its prelude / sketch
    } else if (opts.readOnly) {
      addMetadata(code, opts)
    } else {
      // it should be an editor.
      addMetadata(code, opts)
      addNavigation(code, opts)
    }
    hljs.highlightBlock(code)
  })
}


interface CodeOptions {

  // the language of this piece of code
  language: string,

  // don't display this piece of code
  hidden: boolean,

  // should be prefixed to all following code snippets?
  prelude: boolean,

  // this is a repl with an output
  repl: boolean,

  // do not turn into an editor
  readOnly: boolean,

  // do not typecheck
  sketch: boolean,

  // do not include in prelude of following examples
  ignore: boolean,

  // reset the prelude
  reset: boolean,

  // show core
  core: boolean,

  // show lifted core
  lifted: boolean
}

const defaultLang = "effekt"
const defaultOpts = {
  language: defaultLang,
  hidden: false,
  prelude: false,
  repl: false,
  readOnly: false,
  reset: false,
  ignore: false,
  sketch: false,
  core: false,
  lifted: false
}

function classToOptions(dom: HTMLElement) {

  let opts: CodeOptions = defaultOpts;

  dom.classList.forEach(cls => {
    if (startsWith(cls, "language-")) {
      opts = parseOptions(cls)
    }
  })
  return opts
}

function startsWith(s: string, prefix: string): boolean {
  return s.indexOf(prefix) == 0
}

function parseOptions(str: string): CodeOptions {
  let langRx = /^language-([a-zA-Z_\-$]+)/
  let flags = str.split(':')
  let lang = langRx.exec(str)[1]

  function has(flag) { return flags.indexOf(flag) != -1 }

  return {
    language: lang,
    hidden: has("hide"),
    prelude: has("prelude"),
    repl: has("repl"),
    readOnly: has("read-only"),
    reset: has("reset"),
    ignore: has("ignore"),
    sketch: has("sketch"),
    core: has("core"),
    lifted: has("lifted")
  }
}




window.addEventListener("DOMContentLoaded", () => {

  processCode()

  // let codes = document.querySelectorAll("code")
  // monacoEditor(codes[codes.length - 1])
  hljs.configure({
      languages: ['effekt', 'bash']
  });

  // highlight inline code
  document.querySelectorAll("code").forEach(code => {
    // it is a block code
    if (code.parentElement.tagName == "pre") return;

    hljs.highlightBlock(code)
  })

  docs.init()
})