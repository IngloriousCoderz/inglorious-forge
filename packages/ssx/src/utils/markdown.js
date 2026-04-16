import path from "node:path"

import { toCamelCase } from "@inglorious/utils/data-structures/string.js"
import hljs from "highlight.js"
import katex from "katex"
import MarkdownIt from "markdown-it"
import texmath from "markdown-it-texmath"

export function renderMarkdown(markdown) {
  const md = createMarkdownRenderer()
  // gray-matter gives an error on the client, so we are going to use a simpler way to extract content
  const content = markdown.replace(/^---[\s\S]*?---\n/, "")
  return md.render(content)
}

export function markdownPlugin(options = {}) {
  const { theme = "github-dark" } = options
  const md = createMarkdownRenderer()

  return {
    name: "ssx-markdown",
    enforce: "pre",
    async transform(code, id) {
      if (!id.endsWith(".md")) return

      // prevents importing gray-matter on the client
      const matter = (await import("gray-matter")).default
      const { content, data } = matter(code)
      const htmlContent = md.render(content)
      const moduleName = getMarkdownModuleName(id)
      const hasMermaid =
        content.includes('class="mermaid"') || content.includes("```mermaid")

      let mermaidCode = ""
      if (hasMermaid) {
        mermaidCode = `import mermaid from "mermaid"`
      }

      return `
        import "katex/dist/katex.min.css"
        import "highlight.js/styles/${theme}.css"

        import { html } from "@inglorious/web"
import { unsafeHTML } from "@inglorious/web/directives/unsafe-html"
        ${mermaidCode}

        export const metadata = ${JSON.stringify(data)}
        export const ${moduleName} = {
          render() {
            if (typeof window !== "undefined" && ${hasMermaid}) {
              setTimeout(() => {
                mermaid.run({ querySelector: ".mermaid" })
              })
            }
            return html\`<div class="markdown-body">\${unsafeHTML(${JSON.stringify(htmlContent)})}</div>\`
          }
        }
      `
    },
  }
}

function createMarkdownRenderer() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch (err) {
          console.error(err)
        }
      }
      return "" // use external default escaping
    },
  })

  // Add LaTeX support
  md.use(texmath, {
    engine: katex,
    delimiters: "dollars",
    katexOptions: { macros: { "\\RR": "\\mathbb{R}" } },
  })

  const defaultFence =
    md.renderer.rules.fence?.bind(md.renderer.rules) ||
    ((tokens, idx, options, env, self) =>
      self.renderToken(tokens, idx, options, env, self))

  // Render mermaid fences as standalone blocks (not nested in <pre><code>),
  // avoiding invalid HTML that can cause hydration mismatches.
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const lang = token.info?.trim().split(/\s+/)[0]

    if (lang === "mermaid") {
      return `<div class="mermaid">${md.utils.escapeHtml(token.content)}</div>\n`
    }

    return defaultFence(tokens, idx, options, env, self)
  }

  return md
}

function getMarkdownModuleName(id) {
  const baseName = path.basename(id, path.extname(id))
  const pascalCase = toPascalCase(baseName)
  return /^[A-Za-z_$]/.test(pascalCase) ? pascalCase : `_${pascalCase}`
}

function toPascalCase(input) {
  const camelCase = toCamelCase(input.replace(/[^a-zA-Z0-9_$-]/g, "_"))
  return camelCase.replace(/^[a-z]/, (char) => char.toUpperCase())
}
