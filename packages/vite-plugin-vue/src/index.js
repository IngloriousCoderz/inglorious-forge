import { transformAsync } from "@babel/core"
import { generate } from "@babel/generator"
import syntaxTs from "@babel/plugin-syntax-typescript"
import * as t from "@babel/types"
import { toCamelCase } from "@inglorious/utils/data-structures/string.js"
import path from "path"

import { parseScript } from "./script.js"
import { extractSections } from "./sections.js"
import { parseTemplate, transformTemplate } from "./template.js"

/**
 * Create the Vite plugin that transforms Vue-like templates into lit-html components.
 *
 * @returns {import("vite").Plugin} The Vite plugin instance.
 */
export function vue() {
  return {
    name: "@inglorious/vite-plugin-vue",
    enforce: "pre",
    async transform(code, id) {
      if (!/\.vue$/.test(id)) return null

      try {
        const { template, script, scriptLang } = extractSections(code)

        if (template === null) {
          throw new Error("No <template> tag found in Vue file")
        }

        const componentName = toPascalCase(path.basename(id, path.extname(id)))

        const {
          stateVars,
          renderVars,
          methods,
          scriptImports,
          vueImports,
          importDecls,
        } = script
          ? parseScript(script, scriptLang)
          : {
              stateVars: [],
              renderVars: [],
              methods: [],
              scriptImports: new Set(),
              vueImports: new Set(),
              importDecls: [],
            }

        const dom = parseTemplate(template)
        const { code: templateCode, imports } = transformTemplate(
          dom,
          methods.map((method) => method.name),
          scriptImports,
          new Set(renderVars.map((stateVar) => stateVar.name)),
          vueImports,
        )

        let output = ""
        const importLines = []
        if (imports.has("html")) importLines.push("html")
        if (imports.has("when")) importLines.push("when")
        if (imports.has("repeat")) importLines.push("repeat")

        const generatedImportLines = []
        let mergedWebImport = false

        if (importDecls.length) {
          for (const decl of importDecls) {
            if (decl.source.value === "@inglorious/web") {
              if (importLines.length) {
                const cloned = t.cloneNode(decl, true)
                const existing = new Set()
                for (const specifier of cloned.specifiers) {
                  if (t.isImportSpecifier(specifier)) {
                    existing.add(specifier.imported.name)
                  }
                }
                for (const name of importLines) {
                  if (!existing.has(name)) {
                    cloned.specifiers.push(
                      t.importSpecifier(t.identifier(name), t.identifier(name)),
                    )
                  }
                }
                generatedImportLines.push(generate(cloned).code)
              } else {
                generatedImportLines.push(generate(decl).code)
              }
              mergedWebImport = true
            } else {
              generatedImportLines.push(generate(decl).code)
            }
          }
        }

        if (!mergedWebImport && importLines.length) {
          output += `import { ${importLines.join(", ")} } from "@inglorious/web";\n`
        }

        if (generatedImportLines.length) {
          if (!mergedWebImport && importLines.length) {
            output += "\n"
          }
          output += `${generatedImportLines.join("\n")}\n`
        }

        if (output) {
          output += "\n"
        }

        output += `export const ${componentName} = {\n`

        if (stateVars.length) {
          output += `  create(entity) {\n`
          for (const stateVar of stateVars) {
            output += `    entity.${stateVar.name} = ${stateVar.value}\n`
          }
          output += `  },\n\n`
        }

        for (const method of methods) {
          output += `  ${method.name}(${method.params}) {\n${method.body}  },\n\n`
        }

        output += `  render(entity, api) {\n`
        for (const renderVar of renderVars) {
          output += `    const ${renderVar.name} = ${renderVar.value}\n`
        }
        output += `    return ${templateCode || "html``"};\n`
        output += `  }\n`
        output += `};\n`

        if (scriptLang === "ts") {
          const result = await transformAsync(output, {
            filename: id,
            babelrc: false,
            configFile: false,
            plugins: [[syntaxTs, { isTSX: false }]],
            sourceMaps: true,
          })
          return result && { code: result.code, map: result.map }
        }

        return { code: output, map: null }
      } catch (error) {
        if (this.error) {
          this.error(`Error transforming Vue template: ${error.message}`)
        } else {
          throw new Error(`Error transforming Vue template: ${error.message}`)
        }
      }
    },
  }
}

/**
 * Convert a file stem into PascalCase for the generated component export.
 *
 * @param {string} input - File stem or identifier.
 * @returns {string} PascalCase component name.
 */
function toPascalCase(input) {
  const camelCase = toCamelCase(input)
  return camelCase.replace(/^[a-z]/, (char) => char.toUpperCase())
}
