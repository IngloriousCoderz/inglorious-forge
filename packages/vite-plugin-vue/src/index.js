import { transformAsync } from "@babel/core"
import syntaxTs from "@babel/plugin-syntax-typescript"
import { DomHandler } from "domhandler"
import * as htmlparser2 from "htmlparser2"
import path from "path"

/* -------------------------------- utils -------------------------------- */

function toCamelCase(filename) {
  const base = filename.replace(/\.[^/.]+$/, "")
  return base.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

/* ------------------------------ plugin ---------------------------------- */

export function vue() {
  return {
    name: "@inglorious/vite-plugin-vue",
    enforce: "pre",

    async transform(code, id) {
      if (!id.endsWith(".vue")) return null

      const { template, script, scriptLang } = extractSections(code)
      if (!template) throw new Error("No <template> tag found")

      const componentName = toCamelCase(path.basename(id))

      const dom = parseTemplate(template)
      const { code: templateCode, imports } = transformTemplate(dom)

      const { createCode, helperCode } = transformScript(script || "")

      let output = ""

      if (imports.size) {
        output += `import { ${[...imports].join(", ")} } from "@inglorious/web";\n\n`
      }

      if (helperCode) {
        output += helperCode + "\n\n"
      }

      output += `export const ${componentName} = {\n`

      if (createCode) {
        output += `  create(entity) {\n${createCode}  },\n\n`
      }

      output += `  render(entity, api) {\n`
      output += `    return ${templateCode};\n`
      output += `  }\n`
      output += `};\n`

      if (scriptLang === "ts") {
        const result = await transformAsync(output, {
          filename: id,
          babelrc: false,
          configFile: false,
          plugins: [[syntaxTs, { isTSX: false }]],
        })
        return { code: result.code, map: null }
      }

      return { code: output, map: null }
    },
  }
}

/* --------------------------- section parsing ----------------------------- */

function extractSections(code) {
  const template = code.match(/<template>([\s\S]*?)<\/template>/)
  const script = code.match(
    /<script(?:\s+lang="(ts|typescript)")?\s*>([\s\S]*?)<\/script>/,
  )

  return {
    template: template ? template[1].trim() : null,
    script: script ? script[2].trim() : null,
    scriptLang: script ? script[1] || "js" : null,
  }
}

/* ---------------------------- template parse ----------------------------- */

function parseTemplate(html) {
  const handler = new DomHandler()
  const parser = new htmlparser2.Parser(handler, {
    recognizeSelfClosing: true,
  })
  parser.write(html)
  parser.end()
  return handler.dom
}

/* ---------------------- template → lit-html ------------------------------ */

function transformTemplate(nodes) {
  const imports = new Set(["html"])
  const parts = nodes.map((n) => transformNode(n, imports))
  return {
    code: parts.length === 1 ? parts[0] : `html\`${parts.join("")}\``,
    imports,
  }
}

function transformNode(node, imports) {
  if (node.type === "text") {
    return node.data.replace(
      /\{\{\s*(.+?)\s*\}\}/g,
      (_, e) => `\${entity.${e}}`,
    )
  }

  if (node.type === "tag") {
    return transformElement(node, imports)
  }

  return ""
}

function transformElement(node, imports) {
  const { name, attribs = {}, children = [] } = node

  if (attribs["v-if"]) {
    imports.add("when")
    const cond = `entity.${attribs["v-if"]}`
    delete attribs["v-if"]

    const thenBranch = buildElement(node, imports)
    const elseBranch = findElse(node, imports)

    return `\${when(${cond}, () => ${thenBranch}${
      elseBranch ? `, () => ${elseBranch}` : ""
    })}`
  }

  if (attribs["v-else"] !== undefined) return ""

  if (attribs["v-for"]) {
    imports.add("repeat")
    const [, item, list] = attribs["v-for"].match(/(\w+)\s+in\s+(.+)/)
    delete attribs["v-for"]

    const key = attribs[":key"]
    delete attribs[":key"]

    const body = buildElement(node, imports)

    return key
      ? `\${repeat(entity.${list}, ${item} => ${key}, ${item} => ${body})}`
      : `\${repeat(entity.${list}, ${item} => ${body})}`
  }

  return buildElement(node, imports)
}

function buildElement(node, imports) {
  imports.add("html")
  let out = `<${node.name}`

  for (const [k, v] of Object.entries(node.attribs || {})) {
    if (k.startsWith(":")) {
      out += ` .${k.slice(1)}="\${entity.${v}}"`
    } else if (k.startsWith("@")) {
      out += ` @${k.slice(1)}="\${(e) => ${v}(entity, e)}"`
    } else {
      out += ` ${k}="${v}"`
    }
  }

  out += ">"

  for (const c of node.children || []) {
    out += transformNode(c, imports)
  }

  out += `</${node.name}>`

  return `html\`${out}\``
}

function findElse(node, imports) {
  const siblings = node.parent?.children || []
  const i = siblings.indexOf(node)

  for (let j = i + 1; j < siblings.length; j++) {
    const s = siblings[j]
    if (s.type === "text" && !s.data.trim()) continue
    if (s.attribs?.["v-else"] !== undefined) {
      delete s.attribs["v-else"]
      return buildElement(s, imports)
    }
    break
  }
  return null
}

/* ----------------------- script → create(entity) ------------------------- */

function transformScript(script) {
  if (!script.trim()) return { createCode: "", helperCode: "" }

  const createLines = []
  const helperLines = []

  for (const line of script.split("\n")) {
    const m = line.match(/^(const|let)\s+(\w+)\s*=\s*(.+)$/)
    if (m) {
      createLines.push(`    entity.${m[2]} = ${m[3]}\n`)
    } else {
      helperLines.push(line)
    }
  }

  return {
    createCode: createLines.join(""),
    helperCode: helperLines.join("\n").trim(),
  }
}
