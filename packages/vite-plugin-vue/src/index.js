import { transformAsync } from "@babel/core"
import generate from "@babel/generator"
import * as babelParser from "@babel/parser"
import syntaxTs from "@babel/plugin-syntax-typescript"
import * as t from "@babel/types"
import { DomHandler } from "domhandler"
import * as htmlparser2 from "htmlparser2"
import path from "path"

/**
 * Vite plugin to transform Vue-like template syntax into lit-html templates for @inglorious/web.
 *
 * @returns {import('vite').Plugin} The Vite plugin instance.
 */
export function vue() {
  return {
    name: "@inglorious/vite-plugin-vue",
    enforce: "pre",

    async transform(code, id) {
      // Only process .vue files
      if (!/\.vue$/.test(id)) return null

      try {
        const { template, script, scriptLang } = extractSections(code)

        if (template === null) {
          throw new Error("No <template> tag found in Vue file")
        }

        const componentName = toCamelCase(path.basename(id))

        // Parse the script to understand what's state vs methods
        const { stateVars, methods } = script
          ? parseScript(script, scriptLang)
          : { stateVars: [], methods: [] }

        // Parse the template into a DOM tree
        const dom = parseTemplate(template)

        // Transform the DOM tree into lit-html code
        const { code: templateCode, imports } = transformTemplate(
          dom,
          methods.map((m) => m.name),
        )

        // Build the final output
        let output = ""

        // Add necessary imports
        const importLines = []
        if (imports.has("html")) importLines.push("html")
        if (imports.has("when")) importLines.push("when")
        if (imports.has("repeat")) importLines.push("repeat")

        if (importLines.length > 0) {
          output += `import { ${importLines.join(", ")} } from "@inglorious/web";\n\n`
        }

        // Create the component export
        output += `export const ${componentName} = {\n`

        // Add create() method if there are state variables
        if (stateVars.length > 0) {
          output += `  create(entity) {\n`
          for (const stateVar of stateVars) {
            output += `    entity.${stateVar.name} = ${stateVar.value}\n`
          }
          output += `  },\n\n`
        }

        // Add all methods
        for (const method of methods) {
          output += `  ${method.name}(${method.params}) {\n${method.body}  },\n\n`
        }

        // Add render method
        output += `  render(entity, api) {\n    return ${templateCode};\n  }\n`
        output += `};\n`

        // Transform TypeScript if needed
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
        // In tests, this.error might not exist, so throw directly
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
 * Convert filename to camelCase for component name
 */
function toCamelCase(input) {
  const base = input.replace(/\.[^/.]+$/, "")

  // Step 1: kebab-case → camelCase
  const camel = base.replace(/-([a-z0-9])/gi, (_, c) => c.toUpperCase())

  // Step 2: PascalCase → camelCase
  return camel.charAt(0).toLowerCase() + camel.slice(1)
}

/**
 * Extract <template>, <script>, and <style> sections from a Vue file.
 *
 * @param {string} code - The Vue file content.
 * @returns {{ template: string | null, script: string | null, scriptLang: string | null }}
 */
function extractSections(code) {
  const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/)
  const scriptMatch = code.match(
    /<script(?:\s+lang="(ts|typescript)")?\s*>([\s\S]*?)<\/script>/,
  )

  return {
    template: templateMatch ? templateMatch[1].trim() || "" : null,
    script: scriptMatch ? scriptMatch[2].trim() : null,
    scriptLang: scriptMatch ? scriptMatch[1] || "js" : null,
  }
}

/**
 * Parse script section to identify state variables and methods.
 * State variables: const/let declarations with simple values
 * Methods: arrow functions or function declarations
 *
 * @param {string} script - The script content
 * @param {string} lang - Script language (js or ts)
 * @returns {{ stateVars: Array<{name: string, value: string}>, methods: Array<{name: string, body: string}> }}
 */
function parseScript(script, lang) {
  try {
    const ast = babelParser.parse(script, {
      sourceType: "module",
      plugins: lang === "ts" || lang === "typescript" ? ["typescript"] : [],
    })

    const stateVars = []
    const methods = []

    for (const node of ast.program.body) {
      // Handle variable declarations (const value = 0)
      if (t.isVariableDeclaration(node)) {
        for (const declarator of node.declarations) {
          if (!t.isIdentifier(declarator.id)) continue

          const name = declarator.id.name
          const init = declarator.init

          // Check if it's a function (arrow or regular)
          if (
            t.isArrowFunctionExpression(init) ||
            t.isFunctionExpression(init)
          ) {
            // It's a method - extract the params and body
            const params = extractParams(init)
            const body =
              lang === "ts" || lang === "typescript"
                ? extractFunctionBodyFromAST(init)
                : extractFunctionBody(init, script)
            methods.push({ name, params, body })
          } else {
            // It's a state variable - extract the value
            const value = extractValue(init, script)
            stateVars.push({ name, value })
          }
        }
      }
      // Handle function declarations (function increment(entity) {...})
      else if (t.isFunctionDeclaration(node)) {
        const name = node.id.name
        const params = extractParams(node)
        const body =
          lang === "ts" || lang === "typescript"
            ? extractFunctionBodyFromAST(node)
            : extractFunctionBody(node, script)
        methods.push({ name, params, body })
      }
      // Handle export default (ignore for now, we're building our own export)
      else if (t.isExportDefaultDeclaration(node)) {
        // Skip - we handle this separately
      }
    }

    return { stateVars, methods }
  } catch (error) {
    throw new Error(`Failed to parse script: ${error.message}`)
  }
}

/**
 * Extract function parameters as a string
 */
function extractParams(node) {
  if (!node.params || node.params.length === 0) {
    return "entity"
  }

  const params = node.params.map((param) => {
    if (t.isIdentifier(param)) {
      return param.name
    } else if (t.isRestElement(param)) {
      return `...${param.argument.name}`
    }
    return "entity"
  })

  return params.join(", ")
}

/**
 * Extract function body from AST node (for TypeScript - strips type annotations)
 */
function extractFunctionBodyFromAST(node) {
  // Clone the body to avoid mutating the original
  const body = t.cloneNode(node.body, true)

  if (t.isBlockStatement(body)) {
    // Generate code from AST (this automatically strips TS annotations)
    const { code } = generate(body, { retainLines: false, concise: false })

    // Remove the outer braces and indent
    const lines = code
      .slice(1, -1) // Remove { and }
      .trim()
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")

    return lines + "\n"
  } else {
    // Arrow function with expression body
    const { code } = generate(body, { retainLines: false, concise: true })
    return `    ${code}\n`
  }
}

/**
 * Extract function body as string, removing the first parameter (entity)
 */
function extractFunctionBody(node, source) {
  const body = node.body

  if (t.isBlockStatement(body)) {
    // Extract the block content (between { and })
    const start = body.start + 1 // Skip opening {
    const end = body.end - 1 // Skip closing }
    let bodyCode = source.slice(start, end).trim()

    // Indent the body
    bodyCode = bodyCode
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")

    return bodyCode + "\n"
  } else {
    // Arrow function with expression body: () => entity.count++
    // Convert to statement: entity.count++
    const expr = source.slice(body.start, body.end)
    return `    ${expr}\n`
  }
}

/**
 * Extract value as string from an AST node
 */
function extractValue(node, source) {
  if (!node) return "undefined"
  return source.slice(node.start, node.end)
}

/**
 * Parse HTML template into a DOM tree.
 *
 * @param {string} html - The HTML template string.
 * @returns {Array} Array of DOM nodes.
 */
function parseTemplate(html) {
  const handler = new DomHandler()
  const parser = new htmlparser2.Parser(handler, {
    lowerCaseAttributeNames: false, // Preserve camelCase attributes like maxLength
    lowerCaseTags: false,
  })
  parser.write(html)
  parser.end()
  return handler.dom
}

/**
 * Transform DOM tree into lit-html code.
 *
 * @param {Array} nodes - Array of DOM nodes.
 * @param {Array<string>} methodNames - List of method names to recognize as event handlers
 * @returns {{ code: string, imports: Set<string> }} Generated code and required imports.
 */
function transformTemplate(nodes, methodNames = []) {
  const imports = new Set()
  const parts = []

  for (const node of nodes) {
    parts.push(transformNode(node, imports, methodNames))
  }

  const code = parts.length === 1 ? parts[0] : `html\`${parts.join("")}\``

  return { code, imports }
}

/**
 * Transform a single DOM node into lit-html code.
 *
 * @param {Object} node - DOM node.
 * @param {Set<string>} imports - Set to track required imports.
 * @param {Array<string>} methodNames - List of method names
 * @param {Object} [context] - Contextual information (e.g., v-for loop variable).
 * @returns {string} Generated code for this node.
 */
function transformNode(node, imports, methodNames, context = {}) {
  if (node.type === "text") {
    return transformTextNode(node, imports, context)
  }

  if (node.type === "tag") {
    return transformElementNode(node, imports, methodNames, context)
  }

  return ""
}

/**
 * Transform a text node, handling {{ }} interpolations.
 *
 * @param {Object} node - Text node.
 * @param {Set<string>} imports - Set to track required imports.
 * @param {Object} context - Contextual information.
 * @returns {string} Generated code.
 */
function transformTextNode(node, imports, context) {
  const text = node.data

  // Handle {{ expression }} interpolation
  const parts = []
  let lastIndex = 0
  const regex = /\{\{(.+?)\}\}/g
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the interpolation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add the expression, wrapped with entity. if needed
    const expr = match[1].trim()
    parts.push(`\${${wrapWithEntity(expr, context)}}`)
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.join("")
}

/**
 * Transform an element node with all its directives and attributes.
 *
 * @param {Object} node - Element node.
 * @param {Set<string>} imports - Set to track required imports.
 * @param {Array<string>} methodNames - List of method names
 * @param {Object} context - Contextual information.
 * @returns {string} Generated code.
 */
function transformElementNode(node, imports, methodNames, context) {
  const { name, attribs = {}, children = [] } = node

  // Check for v-if, v-else-if, v-else
  if (attribs["v-if"]) {
    imports.add("when")
    imports.add("html")
    const condition = attribs["v-if"]
    delete attribs["v-if"]

    // Build the consequent (this element without v-if)
    const consequent = buildElement(node, imports, methodNames, context)

    // Check for v-else-if or v-else siblings
    const alternate = findAlternate(node, imports, methodNames, context)

    if (alternate) {
      return `\${when(${wrapWithEntity(condition, context)}, () => ${consequent}, () => ${alternate})}`
    } else {
      return `\${when(${wrapWithEntity(condition, context)}, () => ${consequent})}`
    }
  }

  // Skip v-else-if and v-else (they're handled by v-if)
  if (attribs["v-else-if"] || attribs["v-else"] !== undefined) {
    return ""
  }

  // Check for v-for
  if (attribs["v-for"]) {
    imports.add("repeat")
    imports.add("html")

    const vFor = attribs["v-for"]
    const keyAttr = attribs[":key"] || attribs["v-bind:key"]

    delete attribs["v-for"]
    delete attribs[":key"]
    delete attribs["v-bind:key"]

    // Parse v-for: "item in items" or "(item, index) in items"
    const forMatch = vFor.match(/^(?:\(([^)]+)\)|(\w+))\s+in\s+(.+)$/)
    if (!forMatch) {
      throw new Error(`Invalid v-for syntax: ${vFor}`)
    }

    const params = forMatch[1] || forMatch[2]
    const items = forMatch[3].trim()

    // Parse parameters: "item, index" or "item"
    const paramList = params.split(",").map((p) => p.trim())
    const itemParam = paramList[0]
    const indexParam = paramList[1] || null

    // Build the template function with the new context
    const newContext = { ...context, loopVar: itemParam, indexVar: indexParam }
    const template = buildElement(node, imports, methodNames, newContext)

    // Build repeat() call - items should be wrapped with entity
    const wrappedItems = wrapWithEntity(items, context)

    if (keyAttr) {
      const keyExpr = keyAttr.replace(/^["']|["']$/g, "")
      return `\${repeat(${wrappedItems}, ${itemParam} => ${keyExpr}, (${params}) => ${template})}`
    } else {
      return `\${repeat(${wrappedItems}, (${params}) => ${template})}`
    }
  }

  return buildElement(node, imports, methodNames, context)
}

/**
 * Build an element (opening tag + children + closing tag).
 *
 * @param {Object} node - Element node.
 * @param {Set<string>} imports - Set to track required imports.
 * @param {Array<string>} methodNames - List of method names
 * @param {Object} context - Contextual information.
 * @returns {string} Generated code.
 */
function buildElement(node, imports, methodNames, context) {
  const { name, attribs = {}, children = [] } = node

  // Check if this is a custom component (starts with uppercase)
  if (/^[A-Z]/.test(name)) {
    // Convert component name to camelCase for the entity ID
    const componentId = toCamelCase(name)

    return `\${api.render("${componentId}")}`
  }

  imports.add("html")

  const parts = [`<${name}`]

  // Process attributes
  for (const [key, value] of Object.entries(attribs)) {
    // Skip Vue directives we've already handled
    if (
      key === "v-if" ||
      key === "v-else-if" ||
      key === "v-else" ||
      key === "v-for"
    ) {
      continue
    }

    // Handle :prop or v-bind:prop
    if (key.startsWith(":") || key.startsWith("v-bind:")) {
      const propName = key.startsWith(":")
        ? key.slice(1)
        : key.replace("v-bind:", "")
      const actualName = propName === "class" ? "class" : propName

      // Use . prefix for property binding (unless it's class, id, or kebab-case)
      const prefix =
        actualName.includes("-") ||
        actualName === "class" ||
        actualName === "id"
          ? ""
          : "."

      parts.push(
        ` ${prefix}${actualName}="\${${wrapWithEntity(value, context)}}"`,
      )
      continue
    }

    // Handle @event or v-on:event
    if (key.startsWith("@") || key.startsWith("v-on:")) {
      const eventName = key.startsWith("@")
        ? key.slice(1)
        : key.replace("v-on:", "")

      const handlerValue = value.trim()

      // Check if it's a simple method reference: "methodName"
      if (methodNames.includes(handlerValue)) {
        parts.push(
          ` @${eventName}="\${() => api.notify(\`#\${entity.id}:${handlerValue}\`)}"`,
        )
      }
      // Check if it's an inline arrow function calling a method: "() => methodName(entity, ...args)"
      else {
        // Try to detect method calls like: () => methodName(entity, arg1, arg2)
        const methodCallMatch = handlerValue.match(
          /\(\s*(?:e|\)\s*)?\s*=>\s*(\w+)\s*\(/,
        )

        if (methodCallMatch) {
          const calledMethod = methodCallMatch[1]

          if (methodNames.includes(calledMethod)) {
            // Extract the arguments after entity (e.g., "entity, todo.id" -> "todo.id")
            const argsMatch = handlerValue.match(/\(\s*entity\s*,\s*([^)]+)\)/)

            if (argsMatch) {
              const args = argsMatch[1].trim()
              parts.push(
                ` @${eventName}="\${() => api.notify(\`#\${entity.id}:${calledMethod}\`, ${args})}"`,
              )
            } else {
              // No args after entity, just call with entity
              parts.push(
                ` @${eventName}="\${() => api.notify(\`#\${entity.id}:${calledMethod}\`)}"`,
              )
            }
            continue
          }
        }

        // Not a method call, pass through as-is
        parts.push(` @${eventName}="\${${handlerValue}}"`)
      }
      continue
    }

    // Regular attributes
    parts.push(` ${key}="${value}"`)
  }

  parts.push(">")

  // Process children
  if (children.length > 0) {
    for (const child of children) {
      parts.push(transformNode(child, imports, methodNames, context))
    }
  }

  parts.push(`</${name}>`)

  return `html\`${parts.join("")}\``
}

/**
 * Wrap an expression with entity. prefix if it's not in a loop context
 */
function wrapWithEntity(expr, context) {
  // If we're in a v-for loop and the expression uses the loop variable, don't add entity.
  if (context.loopVar && expr.includes(context.loopVar)) {
    return expr
  }

  // If expression already starts with entity., don't double-wrap
  if (expr.trim().startsWith("entity.")) {
    return expr
  }

  // Otherwise, add entity. prefix
  return `entity.${expr}`
}

/**
 * Find the v-else-if or v-else sibling of a v-if element.
 *
 * @param {Object} node - The v-if element node.
 * @param {Set<string>} imports - Set to track required imports.
 * @param {Array<string>} methodNames - List of method names
 * @param {Object} context - Contextual information.
 * @returns {string|null} Generated code for the alternate, or null.
 */
function findAlternate(node, imports, methodNames, context) {
  const parent = node.parent
  if (!parent || !parent.children) return null

  const siblings = parent.children
  const currentIndex = siblings.indexOf(node)

  // Look for the next sibling element (skip text nodes)
  for (let i = currentIndex + 1; i < siblings.length; i++) {
    const sibling = siblings[i]

    // Skip whitespace-only text nodes
    if (sibling.type === "text" && sibling.data.trim() === "") continue

    // Check if it's v-else-if or v-else
    if (sibling.type === "tag") {
      const { attribs = {} } = sibling

      if (attribs["v-else-if"]) {
        const condition = attribs["v-else-if"]
        delete attribs["v-else-if"]

        const consequent = buildElement(sibling, imports, methodNames, context)
        const alternate = findAlternate(sibling, imports, methodNames, context)

        if (alternate) {
          return `when(${wrapWithEntity(condition, context)}, () => ${consequent}, () => ${alternate})`
        } else {
          return `when(${wrapWithEntity(condition, context)}, () => ${consequent})`
        }
      }

      if (attribs["v-else"] !== undefined) {
        delete attribs["v-else"]
        return buildElement(sibling, imports, methodNames, context)
      }
    }

    // If we hit a non-directive element, stop looking
    break
  }

  return null
}
