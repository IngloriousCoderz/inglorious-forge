import { generate } from "@babel/generator"
import * as babelParser from "@babel/parser"
import * as t from "@babel/types"

const INDENT = "    "
const OPENING_BRACE_OFFSET = 1
const CLOSING_BRACE_OFFSET = 1
const SOURCE_START_OFFSET = 1
const SOURCE_END_OFFSET = 1

/**
 * Parse the script section of a Vue component.
 *
 * @param {string} script - Script source.
 * @param {string} lang - Script language identifier.
 * @returns {{
 *   stateVars: Array<{name: string, value: string}>,
 *   renderVars: Array<{name: string, value: string}>,
 *   methods: Array<{name: string, params: string, body: string}>,
 *   scriptImports: Set<string>,
 *   importDecls: Array<import("@babel/types").ImportDeclaration>,
 * }} Parsed script metadata.
 */
export function parseScript(script, lang) {
  try {
    const ast = babelParser.parse(script, {
      sourceType: "module",
      plugins: lang === "ts" || lang === "typescript" ? ["typescript"] : [],
    })

    const stateVars = []
    const renderVars = []
    const methods = []
    const scriptImports = new Set()
    const importDecls = []
    const renderScopeNames = new Set(["api"])

    for (const node of ast.program.body) {
      if (t.isImportDeclaration(node)) {
        importDecls.push(node)
        for (const specifier of node.specifiers) {
          if (
            t.isImportSpecifier(specifier) ||
            t.isImportDefaultSpecifier(specifier) ||
            t.isImportNamespaceSpecifier(specifier)
          ) {
            scriptImports.add(specifier.local.name)
          }
        }
        continue
      }

      if (t.isVariableDeclaration(node)) {
        for (const declarator of node.declarations) {
          if (!t.isIdentifier(declarator.id)) continue

          const name = declarator.id.name
          const init = declarator.init

          if (
            t.isArrowFunctionExpression(init) ||
            t.isFunctionExpression(init)
          ) {
            const params = extractParams(init)
            const body =
              lang === "ts" || lang === "typescript"
                ? extractFunctionBodyFromAST(init)
                : extractFunctionBody(init, script)
            methods.push({ name, params, body })
          } else {
            const value = extractValue(init, script)
            if (referencesRenderScope(init, renderScopeNames)) {
              renderVars.push({ name, value })
              renderScopeNames.add(name)
            } else {
              stateVars.push({ name, value })
            }
          }
        }
        continue
      }

      if (t.isFunctionDeclaration(node)) {
        const name = node.id.name
        const params = extractParams(node)
        const body =
          lang === "ts" || lang === "typescript"
            ? extractFunctionBodyFromAST(node)
            : extractFunctionBody(node, script)
        methods.push({ name, params, body })
      }
    }

    return { stateVars, renderVars, methods, scriptImports, importDecls }
  } catch (error) {
    throw new Error(`Failed to parse script: ${error.message}`)
  }
}

/**
 * Determine whether an initializer reads from render-scope bindings.
 *
 * @param {import("@babel/types").Node | null | undefined} node - Initializer node.
 * @param {Set<string>} renderScopeNames - Names available in render scope.
 * @returns {boolean} Whether the initializer should be emitted inside render().
 */
function referencesRenderScope(node, renderScopeNames) {
  const stack = [node]
  const visited = new Set()

  while (stack.length) {
    const current = stack.pop()

    if (!current || typeof current !== "object") continue
    if (visited.has(current)) continue
    visited.add(current)

    if (Array.isArray(current)) {
      stack.push(...current)
      continue
    }

    if (t.isIdentifier(current) && renderScopeNames.has(current.name)) {
      return true
    }

    for (const value of Object.values(current)) {
      if (value && typeof value === "object") {
        stack.push(value)
      }
    }
  }

  return false
}

/**
 * Convert a function node's parameters into a comma-separated parameter list.
 *
 * @param {import("@babel/types").FunctionDeclaration | import("@babel/types").FunctionExpression | import("@babel/types").ArrowFunctionExpression} node - Function node.
 * @returns {string} The parameter list string.
 */
export function extractParams(node) {
  if (!node.params || !node.params.length) {
    return "entity"
  }

  const params = node.params.map((param) => {
    if (t.isIdentifier(param)) {
      return param.name
    }

    if (t.isRestElement(param)) {
      return `...${param.argument.name}`
    }

    return "entity"
  })

  return params.join(", ")
}

/**
 * Generate an indented function body from an AST node.
 *
 * @param {import("@babel/types").FunctionDeclaration | import("@babel/types").FunctionExpression | import("@babel/types").ArrowFunctionExpression} node - Function node.
 * @returns {string} Indented function body.
 */
export function extractFunctionBodyFromAST(node) {
  const body = t.cloneNode(node.body, true)

  if (t.isBlockStatement(body)) {
    const { code } = generate(body, { retainLines: false, concise: false })
    const lines = code
      .slice(OPENING_BRACE_OFFSET, code.length - CLOSING_BRACE_OFFSET)
      .trim()
      .split("\n")
      .map((line) => `${INDENT}${line}`)
      .join("\n")

    return `${lines}\n`
  }

  const { code } = generate(body, { retainLines: false, concise: true })
  return `${INDENT}${code}\n`
}

/**
 * Extract a function body from the original source string.
 *
 * @param {import("@babel/types").FunctionDeclaration | import("@babel/types").FunctionExpression | import("@babel/types").ArrowFunctionExpression} node - Function node.
 * @param {string} source - Script source.
 * @returns {string} Indented function body.
 */
export function extractFunctionBody(node, source) {
  const body = node.body

  if (t.isBlockStatement(body)) {
    const start = body.start + SOURCE_START_OFFSET
    const end = body.end - SOURCE_END_OFFSET
    let bodyCode = source.slice(start, end).trim()

    bodyCode = bodyCode
      .split("\n")
      .map((line) => `${INDENT}${line}`)
      .join("\n")

    return `${bodyCode}\n`
  }

  const expr = source.slice(body.start, body.end)
  return `${INDENT}${expr}\n`
}

/**
 * Extract the textual value of a declarator initializer.
 *
 * @param {import("@babel/types").Node | null | undefined} node - Initializer node.
 * @param {string} source - Script source.
 * @returns {string} The initializer text.
 */
export function extractValue(node, source) {
  if (!node) return "undefined"
  return source.slice(node.start, node.end)
}
