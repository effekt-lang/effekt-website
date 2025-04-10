import * as hljs from "./highlight-effekt";
import * as docs from "./docs";
import { IViewModel } from "./ide";

let playgroundModel: IViewModel | null = null;
let replModel: IViewModel | null = null;

async function enableEditing(code: HTMLElement, run: HTMLElement, coreOut: HTMLElement, liftedOut: HTMLElement) {
    const parent = code.parentNode as HTMLElement

    parent.classList.add("editor-loading")

    const IDE = await import(/* webpackMode: "lazy", webpackChunkName: "ide" */ "./ide")
    const editor = await import(/* webpackMode: "lazy", webpackChunkName: "editor" */ "./editor")

    parent.classList.remove("editor-loading")
    parent.classList.add("editor")

    const module: string = code.attributes["module"].value
    const filename = module + ".effekt"
    const contents = code.attributes["content"].value
    code.textContent = ""

    const prelude = code.attributes["prelude"].value || ""
    const postlude = code.attributes["postlude"].value || "\n"

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
    const edit = editor.create(code, run, output, coreOut, liftedOut, model)

    if (code.id === "playground") {
      playgroundModel = model
    } else if (code.id === "repl") {
      replModel = model
    }

    edit
}


function processCode() {
  let fences: NodeListOf<HTMLElement> = document.querySelectorAll("pre > code")

  let id = 0;
  let prelude = ""

  function addMetadata(code: HTMLElement, opts: CodeOptions) {
    const moduleName = "module" + id++
    code.setAttribute("module", moduleName)
    const moduleDecl = "module " + moduleName + "\n"

    const parent: HTMLElement = code.parentElement

    // do not add repls to prelude
    if (opts.repl) {
      parent.classList.add("repl")
      code.setAttribute("prelude", moduleDecl + prelude + "\ndef main() = inspect(\n")
      code.setAttribute("content", code.textContent)
      code.setAttribute("postlude", "\n)\n")
    } else {
      const pre = moduleDecl + prelude
      const post = "\n"
      code.setAttribute("prelude", pre)
      code.setAttribute("postlude", post)
      code.setAttribute("content", code.textContent)

      if (!opts.ignore) {
        prelude = prelude + "import " + moduleName + "\n"
      }
    }
  }

  function addNavigation(code: HTMLElement, opts: CodeOptions) {
    const parent = code.parentNode.parentNode as HTMLElement

    const nav = document.createElement("nav")

    nav.classList.add("code-menu")

    let coreOut: HTMLElement;
    if (opts.core) {
      coreOut = document.createElement("code")
      coreOut.innerHTML = "// Please click 'edit' to show generated core."

      const container = document.createElement("div")
      container.classList.add("core-out")

      const headline = document.createElement("h4")
      headline.innerHTML = "Generated Core"
      container.appendChild(headline)

      const pre = document.createElement("pre")
      pre.append(coreOut)
      container.appendChild(pre)

      parent.insertBefore(container, code.parentNode.nextSibling)
    }

    let liftedCore: HTMLElement;
    if (opts.lifted) {
      liftedCore = document.createElement("code")
      liftedCore.innerHTML = "// Please click 'edit' to show generated lifted core."

      const container = document.createElement("div")
      container.classList.add("core-out")

      const headline = document.createElement("h4")
      headline.innerHTML = "Generated Lifted Core"
      container.appendChild(headline)

      const pre = document.createElement("pre")
      pre.append(liftedCore)
      container.appendChild(pre)

      parent.insertBefore(container, code.parentNode.nextSibling)
    }

    if (opts.repl) {
      const run = document.createElement("button")
      run.classList.add("button-run")
      run.textContent = "run"
      nav.append(run)

      run.onclick = () => {
        enableEditing(code, run, coreOut, liftedCore);
        return false
      }

    } else if (!opts.readOnly) {
      if (code.id === "playground") {
        const share = document.createElement("button")
        share.setAttribute("id", "button-share")
        share.textContent = "share"
        nav.append(share)
      }

      const edit = document.createElement("button")
      edit.classList.add("button-edit")
      edit.textContent = "edit"
      nav.append(edit)

      const activateEditor = () => {
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

    const opts = classToOptions(code)

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
  const langRx = /^language-([a-zA-Z_\-$]+)/
  const flags = str.split(':')
  const lang = langRx.exec(str)[1]

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

// Gets the content of the editor and repl on the playground page and creates
// a shareable link by encoding in base64 and saving it as query parameters in the URL.
// Also updates the current URL accordingly
function share() {
  const url = new URL(window.location.href);
  // get content of playground and repl
  // if either has not been initialised yet, fallback to getting the content of the corresponding html element
  let playgroundContent: string
  if (playgroundModel) {
    playgroundContent = playgroundModel.getValue()
  } else if (document.getElementById("playground")) {
    playgroundContent = document.getElementById("playground").textContent
  } else {
    playgroundContent = ""
  }
  let replContent: string
  if (replModel) {
    replContent = replModel.getValue()
  } else if (document.getElementById("repl")) {
    replContent = document.getElementById("repl").textContent
  } else {
    replContent = ""
  }
  // encode content in base64
  const playgroundEncoded = encodeBase64(playgroundContent)
  const replEncoded = encodeBase64(replContent)
  // set query params in url
  url.searchParams.set("playground", playgroundEncoded)
  url.searchParams.set("repl", replEncoded)
  // save url to clipboard and update the current url
  navigator.clipboard.writeText(url.toString()).then(() => {
    // alert('Link copied to clipboard!');
    // change current URL
    history.pushState(null, "", url.toString())
  }).catch(err => {
    console.error('Error copying text: ', err);
  });
}

function getQueryParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function decodeBase64(base64: string): string {
  try {
    return decodeURIComponent(atob(base64));
  } catch (e) {
    console.error("Failed to decode base64 string:", e);
    return "";
  }
}

function encodeBase64(text: string): string {
  return btoa(encodeURIComponent(text));
}

// Fills the given element (by id) by decoding the value of the associated query parameter in the URL
function fillFromQueryParams(id: string) {
  // Get query parameters
  const param = getQueryParam(id);
  
  // Find the elements
  const element = document.getElementById(id);
  
  // Fill playground if parameter exists and element exists
  if (param && element) {
    showWarning()
    const decodedContent = decodeBase64(param);
    element.textContent = decodedContent;
  } 
}

function showWarning() {
  const warning = document.getElementById("playground-warning")
  if (warning) {
    warning.classList.remove("hidden")
  }
}

window.addEventListener("DOMContentLoaded", () => {
  fillFromQueryParams("playground")
  fillFromQueryParams("repl")

  processCode()

  const shareButton = document.getElementById("button-share")
  if (shareButton) {
    shareButton.onclick = () => {
      showWarning()
      share()
    }
  }

  // const codes = document.querySelectorAll("code")
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
