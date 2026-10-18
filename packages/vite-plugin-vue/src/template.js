import { toCamelCase } from "@inglorious/utils/data-structures/string.js"
import { DomHandler } from "domhandler"
import * as htmlparser2 from "htmlparser2"
import path from "path"

const SPECIAL_DIRECTIVES = new Set([
  "v-if",
  "v-else-if",
  "v-else",
  "v-for",
  ":key",
  "v-bind:key",
])

/**
 * Parse a Vue template into a DOM tree.
 *
 * @param {string} html - Template source.
 * @returns {Array} Parsed DOM nodes.
 */
export function parseTemplate(html) {
  const handler = new DomHandler()
  const parser = new htmlparser2.Parser(handler, {
    xmlMode: true,
    lowerCaseAttributeNames: false,
    lowerCaseTags: false,
    recognizeSelfClosing: true,
  })
  parser.write(html)
  parser.end()
  return handler.dom
}

/**
 * Transform a DOM tree into lit-html code.
 *
 * @param {Array} nodes - DOM nodes to transform.
 * @param {Array<string>} methodNames - Recognized method names.
 * @param {Set<string>} scriptImports - Imported names from the script block.
 * @param {Set<string>} renderScopeNames - Names declared in the render scope.
 * @returns {{ code: string, imports: Set<string> }} Generated code and required imports.
 */
export function transformTemplate(
  nodes,
  methodNames = [],
  scriptImports = new Set(),
  renderScopeNames = new Set(),
  vueImports = new Set(),
) {
  const imports = new Set()
  // Several root elements (a header, a main, a footer) render as one
  // template, each compiled as a child of it.
  // A `v-else` or `v-else-if` belongs to the `v-if` before it.
  const roots = nodes.filter((node) =>
    node.type === "text"
      ? node.data.trim() !== ""
      : !("v-else" in (node.attribs ?? {})) &&
        !("v-else-if" in (node.attribs ?? {})),
  )
  const [, secondRoot] = roots
  const hasSeveralRoots = secondRoot !== undefined

  const parts = nodes.map((node) =>
    transformNode(
      node,
      imports,
      methodNames,
      scriptImports,
      renderScopeNames,
      vueImports,
      {},
      hasSeveralRoots,
    ),
  )

  if (!parts.length) {
    return { code: "html``", imports }
  }

  if (hasSeveralRoots) {
    imports.add("html")
    return { code: `html\`${parts.join("").trim()}\``, imports }
  }

  const [singlePart, secondPart] = parts
  const code =
    secondPart === undefined
      ? unwrapTemplateExpression(singlePart)
      : `html\`${parts.join("")}\``

  return { code, imports }
}

function transformNode(
  node,
  imports,
  methodNames,
  scriptImports,
  renderScopeNames,
  vueImports,
  context = {},
  isChild = false,
) {
  if (node.type === "text") {
    return transformTextNode(node, context, renderScopeNames, scriptImports)
  }

  if (node.type === "tag") {
    return transformElementNode(
      node,
      imports,
      methodNames,
      scriptImports,
      renderScopeNames,
      vueImports,
      context,
      isChild,
    )
  }

  return ""
}

/**
 * Render a child node list into a lit-html template expression.
 *
 * @param {Array} children - Child DOM nodes.
 * @param {Set<string>} imports - Required lit-html imports.
 * @param {Array<string>} methodNames - Recognized method names.
 * @param {Set<string>} scriptImports - Imported names from the script block.
 * @param {Set<string>} renderScopeNames - Names declared in the render scope.
 * @param {Object} context - Rendering context.
 * @returns {string} The rendered child template expression.
 */
function renderChildren(
  children,
  imports,
  methodNames,
  scriptImports,
  renderScopeNames,
  vueImports,
  context,
) {
  if (!children.length) {
    return ""
  }

  const parts = []

  for (const child of children) {
    parts.push(
      transformNode(
        child,
        imports,
        methodNames,
        scriptImports,
        renderScopeNames,
        vueImports,
        context,
        true,
      ),
    )
  }

  return `html\`${parts.join("")}\``
}

/**
 * Transform a text node, preserving static text and interpolating `{{ }}` expressions.
 *
 * @param {Object} node - DOM text node.
 * @param {Object} context - Rendering context.
 * @param {Set<string>} renderScopeNames - Names declared in the render scope.
 * @param {Set<string>} scriptImports - Imported names from the script block.
 * @returns {string} Transformed text.
 */
export function transformTextNode(
  node,
  context,
  renderScopeNames = new Set(),
  scriptImports = new Set(),
) {
  const text = node.data
  const parts = []
  let lastIndex = 0
  // Across line breaks too: Prettier wraps a long interpolation.
  const regex = /\{\{([\s\S]+?)\}\}/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const [fullMatch, expr] = match
    parts.push(
      `\${${wrapWithEntity(expr, context, scriptImports, renderScopeNames)}}`,
    )
    lastIndex = match.index + fullMatch.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.join("")
}

/**
 * Transform an element node, handling directives and bindings.
 *
 * @param {Object} node - DOM element node.
 * @param {Set<string>} imports - Required lit-html imports.
 * @param {Array<string>} methodNames - Recognized method names.
 * @param {Set<string>} scriptImports - Imported names from the script block.
 * @param {Set<string>} renderScopeNames - Names declared in the render scope.
 * @param {Object} context - Rendering context.
 * @param {boolean} isChild - Whether the node is nested inside another element.
 * @returns {string} Transformed node code.
 */
export function transformElementNode(
  node,
  imports,
  methodNames,
  scriptImports,
  renderScopeNames,
  vueImports,
  context,
  isChild = false,
) {
  const { attribs = {} } = node

  if (attribs["v-if"]) {
    imports.add("when")
    imports.add("html")
    const condition = attribs["v-if"]
    delete attribs["v-if"]

    const consequent = buildElement(
      node,
      imports,
      methodNames,
      scriptImports,
      renderScopeNames,
      vueImports,
      context,
      false,
    )
    const alternate = findAlternate(
      node,
      imports,
      methodNames,
      scriptImports,
      renderScopeNames,
      vueImports,
      context,
      isChild,
    )

    if (alternate) {
      return `\${when(${wrapWithEntity(
        condition,
        context,
        scriptImports,
        renderScopeNames,
      )}, () => ${unwrapTemplateExpression(
        consequent,
      )}, () => ${unwrapTemplateExpression(alternate)})}`
    }

    return `\${when(${wrapWithEntity(
      condition,
      context,
      scriptImports,
      renderScopeNames,
    )}, () => ${unwrapTemplateExpression(consequent)})}`
  }

  if (attribs["v-else-if"] || attribs["v-else"] !== undefined) {
    return ""
  }

  if (attribs["v-for"]) {
    imports.add("repeat")
    imports.add("html")

    const vFor = attribs["v-for"]
    const keyAttr = attribs[":key"] || attribs["v-bind:key"]

    delete attribs["v-for"]
    delete attribs[":key"]
    delete attribs["v-bind:key"]

    const forMatch = vFor.match(/^(?:\(([^)]+)\)|(\w+))\s+in\s+(.+)$/)
    if (!forMatch) throw new Error(`Invalid v-for syntax: ${vFor}`)

    const [, paramsA, paramsB, items] = forMatch
    const params = paramsA || paramsB
    const itemList = items.trim()
    const [itemParam, indexParam = null] = params
      .split(",")
      .map((param) => param.trim())

    const newContext = { ...context, loopVar: itemParam, indexVar: indexParam }
    const template = buildElement(
      node,
      imports,
      methodNames,
      scriptImports,
      renderScopeNames,
      vueImports,
      newContext,
      false,
    )

    const wrappedItems = wrapWithEntity(
      itemList,
      context,
      scriptImports,
      renderScopeNames,
    )

    if (keyAttr) {
      const keyExpr = keyAttr.replace(/^["']|["']$/g, "")
      return `\${repeat(${wrappedItems}, ${itemParam} => ${keyExpr}, (${params}) => ${unwrapTemplateExpression(template)})}`
    }

    return `\${repeat(${wrappedItems}, (${params}) => ${unwrapTemplateExpression(template)})}`
  }

  return buildElement(
    node,
    imports,
    methodNames,
    scriptImports,
    renderScopeNames,
    vueImports,
    context,
    isChild,
  )
}

/**
 * Build a single element string including its children.
 *
 * @param {Object} node - DOM element node.
 * @param {Set<string>} imports - Required lit-html imports.
 * @param {Array<string>} methodNames - Recognized method names.
 * @param {Set<string>} scriptImports - Imported names from the script block.
 * @param {Set<string>} renderScopeNames - Names declared in the render scope.
 * @param {Object} context - Rendering context.
 * @param {boolean} isChild - Whether the node is nested inside another element.
 * @returns {string} Transformed element string.
 */
export function buildElement(
  node,
  imports,
  methodNames,
  scriptImports,
  renderScopeNames,
  vueImports,
  context,
  isChild = false,
) {
  const { name, attribs = {}, children = [] } = node

  if (/^[A-Z]/.test(name)) {
    const componentId = toCamelCase(path.basename(name))
    const props = {}
    let spreadValue = null
    for (const [key, value] of Object.entries(attribs)) {
      if (SPECIAL_DIRECTIVES.has(key)) continue

      if (key === "v-bind") {
        spreadValue = normalizeWhitespace(value)
        continue
      }

      if (key.startsWith(":") || key.startsWith("v-bind:")) {
        const propName = key.startsWith(":")
          ? key.slice(":".length)
          : key.replace("v-bind:", "")
        props[propName] = wrapWithEntity(
          normalizeWhitespace(value),
          context,
          scriptImports,
          renderScopeNames,
        )
        continue
      }

      props[key] = `"${value}"`
    }

    const childrenTemplate = renderChildren(
      children,
      imports,
      methodNames,
      scriptImports,
      renderScopeNames,
      vueImports,
      context,
    )

    if (childrenTemplate) {
      props.children = childrenTemplate
    }

    // `aria-label` and other kebab-case names are quoted, to stay valid keys.
    const propsStr = Object.entries(props)
      .map(
        ([key, value]) =>
          `${/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)}: ${value}`,
      )
      .join(", ")
    const spreadArg = spreadValue
      ? wrapWithEntity(spreadValue, context, scriptImports, renderScopeNames)
      : ""
    const propsArg = spreadArg
      ? propsStr
        ? `{ ...${spreadArg}, ${propsStr} }`
        : spreadArg
      : propsStr
        ? `{ ${propsStr} }`
        : ""

    if (scriptImports.has(name)) {
      if (!propsArg) {
        return `\${api.render("${componentId}", "${name}", ${name})}`
      }

      if (
        vueImports.has(name) &&
        spreadValue &&
        !propsStr &&
        !childrenTemplate &&
        /^[A-Za-z_$][\w$]*$/.test(spreadValue)
      ) {
        return `\${api.render("${spreadValue}", "${name}", ${name})}`
      }

      return `\${${name}.render(${propsArg}, api)}`
    }

    return `\${api.render("${componentId}"${propsArg ? `, ${propsArg}` : ""})}`
  }

  imports.add("html")

  const parts = [`<${name}`]

  for (const [key, value] of Object.entries(attribs)) {
    if (["v-if", "v-else-if", "v-else", "v-for"].includes(key)) continue

    if (key.startsWith(":") || key.startsWith("v-bind:")) {
      const propName = key.startsWith(":")
        ? key.slice(":".length)
        : key.replace("v-bind:", "")
      const actualName = propName === "class" ? "class" : propName
      const prefix =
        actualName.includes("-") ||
        actualName === "class" ||
        actualName === "id"
          ? ""
          : "."

      const wrapped = wrapWithEntity(
        normalizeWhitespace(value),
        context,
        scriptImports,
        renderScopeNames,
      )
      const needsParens = wrapped.trimStart().startsWith("{")
      const expr = needsParens ? `(${wrapped})` : wrapped
      parts.push(` ${prefix}${actualName}="\${${expr}}"`)
      continue
    }

    if (key.startsWith("@") || key.startsWith("v-on:")) {
      const eventName = key.startsWith("@")
        ? key.slice("@".length)
        : key.replace("v-on:", "")
      const handlerValue = value.trim()

      if (methodNames.includes(handlerValue)) {
        parts.push(
          ` @${eventName}="\${() => api.notify(\`#\${entity.id}:${handlerValue}\`)}"`,
        )
      } else {
        const methodCallMatch = handlerValue.match(
          /\(\s*(?:e|\)\s*)?\s*=>\s*(\w+)\s*\(/,
        )
        if (methodCallMatch) {
          const [, calledMethod] = methodCallMatch
          if (methodNames.includes(calledMethod)) {
            const argsMatch = handlerValue.match(/\(\s*entity\s*,\s*([^)]+)\)/)
            if (argsMatch) {
              const [, args] = argsMatch
              parts.push(
                ` @${eventName}="\${() => api.notify(\`#\${entity.id}:${calledMethod}\`, ${args.trim()})}"`,
              )
            } else {
              parts.push(
                ` @${eventName}="\${() => api.notify(\`#\${entity.id}:${calledMethod}\`)}"`,
              )
            }
            continue
          }
        }
        parts.push(` @${eventName}="\${${handlerValue}}"`)
      }
      continue
    }

    parts.push(` ${key}="${value}"`)
  }

  parts.push(">")

  for (const child of children) {
    parts.push(
      transformNode(
        child,
        imports,
        methodNames,
        scriptImports,
        renderScopeNames,
        vueImports,
        context,
        true,
      ),
    )
  }

  parts.push(`</${name}>`)

  const inner = parts.join("")
  return isChild ? inner : `html\`${inner}\``
}

/**
 * Prefix bare expressions with `entity.` when they are not already scoped.
 *
 * @param {string} expr - Expression to wrap.
 * @param {Object} context - Rendering context.
 * @param {Set<string>} scriptImports - Imported names from the script block.
 * @param {Set<string>} renderScopeNames - Names declared in the render scope.
 * @returns {string} Normalized expression.
 */
export function wrapWithEntity(
  expr,
  context,
  scriptImports = new Set(),
  renderScopeNames = new Set(),
) {
  const trimmed = expr.trim()
  const renderScopeNameSet =
    renderScopeNames instanceof Set
      ? renderScopeNames
      : new Set(renderScopeNames)

  if (context.loopVar && trimmed.includes(context.loopVar)) return trimmed
  if (trimmed.startsWith("entity.")) return trimmed
  if (trimmed.startsWith("api.")) return trimmed
  if (trimmed.startsWith("!api.")) return trimmed

  // An inline function, such as a callback passed to a component, is code in
  // its own right: its parameters and body are not entity fields.
  if (isFunctionExpression(trimmed)) return trimmed

  if (
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed.startsWith("`") ||
    trimmed.startsWith("'") ||
    trimmed.startsWith('"') ||
    trimmed === "true" ||
    trimmed === "false" ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    /^\d/.test(trimmed)
  ) {
    return trimmed
  }

  const [rootIdent] = trimmed.match(/^([a-zA-Z_$][\w$]*)/) || []
  if (rootIdent && renderScopeNameSet.has(rootIdent)) return trimmed
  if (rootIdent && scriptImports.has(rootIdent)) return trimmed

  return `entity.${trimmed}`
}

/**
 * Whether an expression is an inline function: `(a) => …`, `a => …`,
 * `async (a) => …` or `function (a) { … }`.
 *
 * @param {string} expr - A trimmed template expression.
 * @returns {boolean}
 */
function isFunctionExpression(expr) {
  return /^(async\s+)?(\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>|^(async\s+)?function\b/.test(
    expr,
  )
}

/**
 * Find the next `v-else-if` or `v-else` sibling for a `v-if` node.
 *
 * @param {Object} node - The current node.
 * @param {Set<string>} imports - Required lit-html imports.
 * @param {Array<string>} methodNames - Recognized method names.
 * @param {Set<string>} scriptImports - Imported names from the script block.
 * @param {Set<string>} renderScopeNames - Names declared in the render scope.
 * @param {Object} context - Rendering context.
 * @param {boolean} isChild - Whether the current node is nested.
 * @returns {string | null} Alternate branch code.
 */
export function findAlternate(
  node,
  imports,
  methodNames,
  scriptImports,
  renderScopeNames,
  vueImports,
  context,
  isChild = false,
) {
  const parent = node.parent
  if (!parent || !parent.children) return null

  const siblings = parent.children
  const currentIndex = siblings.indexOf(node)

  const [, ...followingSiblings] = siblings.slice(currentIndex)
  for (const sibling of followingSiblings) {
    if (sibling.type === "text" && sibling.data.trim() === "") continue

    if (sibling.type === "tag") {
      const { attribs = {} } = sibling

      if (attribs["v-else-if"]) {
        const condition = attribs["v-else-if"]
        delete attribs["v-else-if"]

        const consequent = buildElement(
          sibling,
          imports,
          methodNames,
          scriptImports,
          renderScopeNames,
          vueImports,
          context,
          false,
        )
        const alternate = findAlternate(
          sibling,
          imports,
          methodNames,
          scriptImports,
          renderScopeNames,
          vueImports,
          context,
          isChild,
        )

        if (alternate) {
          return `when(${wrapWithEntity(
            condition,
            context,
            scriptImports,
            renderScopeNames,
          )}, () => ${unwrapTemplateExpression(consequent)}, () => ${unwrapTemplateExpression(alternate)})`
        }

        return `when(${wrapWithEntity(
          condition,
          context,
          scriptImports,
          renderScopeNames,
        )}, () => ${unwrapTemplateExpression(consequent)})`
      }

      if (attribs["v-else"] !== undefined) {
        return buildElement(
          sibling,
          imports,
          methodNames,
          scriptImports,
          renderScopeNames,
          vueImports,
          context,
          false,
        )
      }
    }

    break
  }

  return null
}

/**
 * Remove template interpolation wrappers from a raw expression string.
 *
 * @param {string} code - Rendered snippet.
 * @returns {string} Either the raw expression or the original code.
 */
function unwrapTemplateExpression(code) {
  if (code.startsWith("${") && code.endsWith("}")) {
    return code.slice("${".length, code.length - "}".length)
  }

  return code
}

/**
 * Collapse repeated whitespace into single spaces.
 *
 * @param {string} str - Raw attribute value.
 * @returns {string} Normalized string.
 */
export function normalizeWhitespace(str) {
  return str.replace(/\s+/g, " ").trim()
}
