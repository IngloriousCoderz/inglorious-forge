import { transformAsync, types as t } from "@babel/core"
import syntaxJsx from "@babel/plugin-syntax-jsx"
import syntaxTs from "@babel/plugin-syntax-typescript"

const NOT_FOUND = -1
const LAST = 1
const AFTER_ON = 2

const VOID_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]

/**
 * Vite plugin to transform JSX into lit-html templates for @inglorious/web.
 *
 * @returns {import('vite').Plugin} The Vite plugin instance.
 */
export function jsx() {
  return {
    name: "@inglorious/vite-plugin-jsx",
    enforce: "pre", // runs before esbuild

    async transform(code, id) {
      if (!/\.[jt]sx$/.test(id)) return null

      const result = await transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        plugins: [syntaxJsx, [syntaxTs, { isTSX: true }], jsxToLit()],
        sourceMaps: true,
      })

      return result && { code: result.code, map: result.map }
    },
  }
}

/**
 * Babel plugin factory that traverses the AST to transform JSX elements.
 *
 * @returns {import('@babel/core').PluginObj} The Babel visitor object.
 */
function jsxToLit() {
  return {
    visitor: {
      Program: {
        enter(path) {
          path.__needsHtml = false
          path.__needsWhen = false
          path.__needsRepeat = false
        },
        exit(path) {
          const importSource = "@inglorious/web"
          const needed = new Set()
          if (path.__needsHtml) needed.add("html")
          if (path.__needsWhen) needed.add("when")
          if (path.__needsRepeat) needed.add("repeat")

          if (!needed.size) return

          let importDecl = null

          // Find existing import from '@inglorious/web' and remove already imported names from `needed`
          path.get("body").forEach((nodePath) => {
            if (
              nodePath.isImportDeclaration() &&
              nodePath.node.source.value === importSource
            ) {
              importDecl = nodePath
              for (const specifier of nodePath.get("specifiers")) {
                if (specifier.isImportSpecifier()) {
                  needed.delete(specifier.node.imported.name)
                }
              }
            }
          })

          const specifiersToAdd = [...needed].map(createImportSpecifier)

          if (specifiersToAdd.length) {
            if (importDecl) {
              // Add missing specifiers to the existing import declaration
              importDecl.pushContainer("specifiers", specifiersToAdd)
            } else {
              // Or, create a new import declaration
              path.unshiftContainer(
                "body",
                t.importDeclaration(
                  specifiersToAdd,
                  t.stringLiteral(importSource),
                ),
              )
            }
          }
        },
      },

      JSXElement(path) {
        path.findParent((p) => p.isProgram()).__needsHtml = true
        path.replaceWith(buildTemplate(path.node, path))
      },

      JSXFragment(path) {
        path.findParent((p) => p.isProgram()).__needsHtml = true
        path.replaceWith(buildFragment(path.node, path))
      },

      // Transform {cond ? <A/> : <B/>} -> ${when(cond, () => html`<A/>`, () => html`<B/>`)}
      ConditionalExpression(path) {
        const { test, consequent, alternate } = path.node
        if (isJsx(consequent) || isJsx(alternate)) {
          path.findParent((p) => p.isProgram()).__needsWhen = true
          path.replaceWith(
            t.callExpression(t.identifier("when"), [
              test,
              t.arrowFunctionExpression([], consequent),
              t.arrowFunctionExpression([], alternate),
            ]),
          )
        }
      },

      // Transform {cond && <A/>} -> ${when(cond, () => html`<A/>`)}
      LogicalExpression(path) {
        if (path.node.operator === "&&" && isJsx(path.node.right)) {
          path.findParent((p) => p.isProgram()).__needsWhen = true
          path.replaceWith(
            t.callExpression(t.identifier("when"), [
              path.node.left,
              t.arrowFunctionExpression([], path.node.right),
            ]),
          )
        }
      },

      // Transform items.map(i => <A key={i.id}/>) -> ${repeat(items, i => i.id, i => html`<A.../>`)}
      CallExpression(path) {
        const { callee, arguments: args } = path.node
        const [arrow] = args

        if (
          t.isMemberExpression(callee) &&
          callee.property.name === "map" &&
          t.isArrowFunctionExpression(arrow)
        ) {
          if (isJsx(arrow.body)) {
            if (
              !path.findParent(
                (p) => p.isJSXExpressionContainer() || p.isReturnStatement(),
              )
            ) {
              return
            }

            path.findParent((p) => p.isProgram()).__needsRepeat = true

            const items = callee.object
            const templateFn = arrow
            const repeatArgs = [items]

            // Try to extract key from the returned JSX element
            // Look for key={...} in the opening element attributes
            let keyExpr = null
            if (t.isJSXElement(arrow.body)) {
              const keyAttr = arrow.body.openingElement.attributes.find(
                (attr) => attr.name && attr.name.name === "key",
              )
              if (keyAttr && keyAttr.value.type === "JSXExpressionContainer") {
                keyExpr = keyAttr.value.expression
              }
            }

            // If key found, inject key function as 2nd argument: (item) => item.id
            if (keyExpr) {
              repeatArgs.push(t.arrowFunctionExpression(arrow.params, keyExpr))
            } else {
              // If no key, repeat acts like map, but we can still use it
              // Or we could skip repeat and just let map run (lit handles arrays)
              // But user asked for repeat.
            }

            repeatArgs.push(templateFn)

            path.replaceWith(
              t.callExpression(t.identifier("repeat"), repeatArgs),
            )
          }
        }
      },
    },
  }
}

/**
 * Converts a JSXElement node into a lit-html TaggedTemplateExpression.
 *
 * @param {import('@babel/types').JSXElement} node - The JSX element node.
 * @param {import('@babel/core').NodePath} [path] - The path to the node.
 * @param {boolean} [isSvg=false] - Whether we are inside an SVG context.
 * @returns {import('@babel/types').TaggedTemplateExpression} The transformed node.
 */
function buildTemplate(node, path, isSvg = false) {
  const tag = node.openingElement.name.name

  // If capitalized → engine component
  if (/^[A-Z]/.test(tag)) {
    if (path) {
      const fn = path.getFunctionParent()
      if (fn) {
        let isRender = false
        // ObjectMethod: { render() {} }
        if (fn.isObjectMethod() && fn.node.key.name === "render") {
          isRender = true
        }
        // ObjectProperty: { render: () => {} } or { render: function() {} }
        else if (
          fn.parentPath.isObjectProperty() &&
          fn.parentPath.node.key.name === "render"
        ) {
          isRender = true
        }

        if (isRender) {
          const params = fn.node.params
          const apiIndex = params.findIndex(
            (p) => t.isIdentifier(p) && p.name === "api",
          )

          if (apiIndex !== NOT_FOUND) {
            if (apiIndex !== params.length - LAST) {
              const lastParam = params[params.length - LAST]
              if (t.isRestElement(lastParam)) {
                throw fn.buildCodeFrameError(
                  "Cannot move 'api' parameter to the end because of a rest element.",
                )
              }
              const apiPath = fn.get("params")[apiIndex]
              const apiNode = apiPath.node
              apiPath.remove()
              fn.pushContainer("params", apiNode)
            }
          } else {
            const lastParam = params[params.length - LAST]
            if (lastParam && t.isRestElement(lastParam)) {
              throw fn.buildCodeFrameError(
                "Cannot inject 'api' parameter because of a rest element.",
              )
            }
            fn.pushContainer("params", t.identifier("api"))
          }
        }
      }
    }

    const props = []

    for (const attr of node.openingElement.attributes) {
      if (t.isJSXSpreadAttribute(attr)) {
        props.push(t.spreadElement(attr.argument))
        continue
      }

      const key = attr.name.name
      let value

      if (!attr.value) {
        value = t.booleanLiteral(true)
      } else if (t.isJSXExpressionContainer(attr.value)) {
        value = attr.value.expression
      } else {
        value = attr.value
      }

      props.push(t.objectProperty(t.identifier(key), value))
    }

    // Check if the tag is in scope (e.g. imported)
    if (path && path.scope.hasBinding(tag)) {
      return t.callExpression(
        t.memberExpression(t.identifier(tag), t.identifier("render")),
        props.length ? [t.objectExpression(props)] : [],
      )
    }

    const name = toCamelCase(tag)

    return t.callExpression(
      t.memberExpression(t.identifier("api"), t.identifier("render")),
      props.length
        ? [t.stringLiteral(name), t.objectExpression(props)]
        : [t.stringLiteral(name)],
    )
  }

  const isCurrentSvg = isSvg || tag === "svg"
  let text = `<${tag}`
  const quasis = []
  const exprs = []

  for (const attr of node.openingElement.attributes) {
    let name = attr.name.name
    const value = attr.value

    if (name === "className") name = "class"

    if (name.startsWith("on")) {
      if (!value || value.type !== "JSXExpressionContainer") {
        if (path) {
          throw path.buildCodeFrameError(
            `Event handler ${name} must be an expression`,
          )
        }
        throw new Error(`Event handler ${name} must be an expression`)
      }
      quasis.push(tpl(`${text} @${name.slice(AFTER_ON).toLowerCase()}=`))
      exprs.push(value.expression)
      text = ""
      continue
    }

    if (!value) {
      text += ` ${name}`
      continue
    }

    if (value.type === "JSXExpressionContainer") {
      // Use property binding (.) only if it's not a standard attribute or kebab-case
      const prefix =
        name.includes("-") || name === "class" || name === "id" ? "" : "."
      quasis.push(tpl(`${text} ${prefix}${name}=`))
      exprs.push(value.expression)
      text = ""
      continue
    }

    text += ` ${name}="${value.value}"`
  }

  // Handle Void tags (always self-closing) and SVG self-closing tags
  if (
    VOID_TAGS.includes(tag) ||
    (node.openingElement.selfClosing && isCurrentSvg)
  ) {
    text += " />"
    quasis.push(tpl(text, true))
    return {
      type: "TaggedTemplateExpression",
      tag: { type: "Identifier", name: "html" },
      quasi: { type: "TemplateLiteral", quasis, expressions: exprs },
    }
  }

  // Handle non-void HTML tags that are self-closing in JSX (e.g. <div />)
  // These must be expanded to <div></div> for the browser parser.
  if (node.openingElement.selfClosing) {
    text += `></${tag}>`
    quasis.push(tpl(text, true))
    return {
      type: "TaggedTemplateExpression",
      tag: { type: "Identifier", name: "html" },
      quasi: { type: "TemplateLiteral", quasis, expressions: exprs },
    }
  }

  text += ">"

  const nextIsSvg = isCurrentSvg && tag !== "foreignObject"
  const childrenPaths = path ? path.get("children") : []

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    const childPath = childrenPaths[i]

    if (child.type === "JSXText") {
      text += child.value.replace(/\s+/g, " ")
    } else if (child.type === "JSXExpressionContainer") {
      if (child.expression.type === "JSXEmptyExpression") continue
      quasis.push(tpl(text))
      exprs.push(child.expression)
      text = ""
    } else {
      quasis.push(tpl(text))
      exprs.push(
        child.type === "JSXFragment"
          ? buildFragment(child, childPath, nextIsSvg)
          : buildTemplate(child, childPath, nextIsSvg),
      )
      text = ""
    }
  }

  text += `</${tag}>`
  quasis.push(tpl(text, true))

  return {
    type: "TaggedTemplateExpression",
    tag: { type: "Identifier", name: "html" },
    quasi: { type: "TemplateLiteral", quasis, expressions: exprs },
  }
}

/**
 * Converts a JSXFragment node into a lit-html TaggedTemplateExpression.
 *
 * @param {import('@babel/types').JSXFragment} node - The JSX fragment node.
 * @param {import('@babel/core').NodePath} [path] - The path to the node.
 * @param {boolean} [isSvg=false] - Whether we are inside an SVG context.
 * @returns {import('@babel/types').TaggedTemplateExpression} The transformed node.
 */
function buildFragment(node, path, isSvg = false) {
  let text = ""
  const quasis = []
  const exprs = []

  const childrenPaths = path ? path.get("children") : []
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    const childPath = childrenPaths[i]

    if (child.type === "JSXText") {
      text += child.value.replace(/\s+/g, " ")
    } else if (child.type === "JSXExpressionContainer") {
      if (child.expression.type === "JSXEmptyExpression") continue
      quasis.push(tpl(text))
      exprs.push(child.expression)
      text = ""
    } else {
      quasis.push(tpl(text))
      exprs.push(
        child.type === "JSXFragment"
          ? buildFragment(child, childPath, isSvg)
          : buildTemplate(child, childPath, isSvg),
      )
      text = ""
    }
  }

  quasis.push(tpl(text, true))

  return {
    type: "TaggedTemplateExpression",
    tag: { type: "Identifier", name: "html" },
    quasi: { type: "TemplateLiteral", quasis, expressions: exprs },
  }
}

/**
 * Helper to create a Babel TemplateElement node.
 *
 * @param {string} raw - The raw string content of the template part.
 * @param {boolean} [tail=false] - Whether this is the last part of the template.
 * @returns {import('@babel/types').TemplateElement} The template element node.
 */
function tpl(raw, tail = false) {
  return { type: "TemplateElement", value: { raw, cooked: raw }, tail }
}

function createImportSpecifier(name) {
  return {
    type: "ImportSpecifier",
    imported: { type: "Identifier", name },
    local: { type: "Identifier", name },
  }
}

/**
 * Convert PascalCase or kebab-case to camelCase.
 *
 * @param {string} input - The string to convert.
 * @returns {string} The camelCased string.
 */
function toCamelCase(input) {
  // Step 1: kebab-case → camelCase
  const [firstChar, ...rest] = input.replace(/-([a-z0-9])/gi, (_, c) =>
    c.toUpperCase(),
  )

  // Step 2: PascalCase → camelCase
  return [firstChar.toLowerCase(), ...rest].join("")
}

function isJsx(node) {
  return (
    node.type === "JSXElement" ||
    node.type === "JSXFragment" ||
    (node.type === "CallExpression" && node.callee.name === "html") // Already transformed
  )
}
