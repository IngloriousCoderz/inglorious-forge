import { types as t } from "@babel/core"
import { toCamelCase } from "@inglorious/utils/data-structures/string.js"

import { tpl } from "./utils.js"

const AFTER_ON = 2
const LAST = 1
const NOT_FOUND = -1
const NEXT = 1

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
 * Create a lit-html tagged template expression node.
 *
 * @param {Array} quasis - Template chunks.
 * @param {Array} expressions - Template expressions.
 * @returns {import("@babel/types").TaggedTemplateExpression} The template expression.
 */
function createTemplateExpression(quasis, expressions) {
  return {
    type: "TaggedTemplateExpression",
    tag: { type: "Identifier", name: "html" },
    quasi: { type: "TemplateLiteral", quasis, expressions },
  }
}

/**
 * Ensure a render method has an `api` parameter in the right position.
 *
 * @param {import("@babel/core").NodePath} fn - The render function path.
 */
function ensureRenderApiParameter(fn) {
  const params = fn.node.params
  const apiIndex = params.findIndex(
    (param) => t.isIdentifier(param) && param.name === "api",
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
    return
  }

  const lastParam = params[params.length - LAST]
  if (lastParam && t.isRestElement(lastParam)) {
    throw fn.buildCodeFrameError(
      "Cannot inject 'api' parameter because of a rest element.",
    )
  }

  fn.pushContainer("params", t.identifier("api"))
}

/**
 * Inline a nested template literal into the current template buffers.
 *
 * @param {string} text - The accumulated text buffer.
 * @param {import("@babel/types").TaggedTemplateExpression} childTemplate - The child template.
 * @param {Array} quasis - Parent template quasis.
 * @param {Array} exprs - Parent template expressions.
 * @returns {string} The new accumulated text buffer.
 */
function inlineChildTemplate(text, childTemplate, quasis, exprs) {
  const { quasis: childQuasis, expressions: childExpressions } =
    childTemplate.quasi
  const [firstChildQuasi] = childQuasis

  if (!childExpressions.length) {
    return text + firstChildQuasi.value.raw
  }

  quasis.push(tpl(text + firstChildQuasi.value.raw))

  for (let index = 0; index < childExpressions.length - LAST; index++) {
    exprs.push(childExpressions[index])
    quasis.push(childQuasis[index + NEXT])
  }

  const lastIndex = childExpressions.length - LAST
  exprs.push(childExpressions[lastIndex])

  return childQuasis[childQuasis.length - LAST].value.raw
}

/**
 * Determine whether a tag name is a capitalized component.
 *
 * @param {string} tag - The JSX tag name.
 * @returns {boolean} True when the tag should be treated as a component.
 */
function isCapitalizedComponent(tag) {
  return /^[A-Z]/.test(tag)
}

/**
 * Read the child NodePaths for a JSX node when the caller has a path.
 *
 * @param {import("@babel/core").NodePath | null | undefined} path - The JSX path.
 * @returns {Array} Child paths or an empty array.
 */
function getChildrenPaths(path) {
  return path ? path.get("children") : []
}

/**
 * Find the surrounding render method or render property function for a JSX path.
 *
 * @param {import("@babel/core").NodePath | null | undefined} path - The current JSX path.
 * @returns {import("@babel/core").NodePath | null} The function path that owns the render method.
 */
function findRenderFunction(path) {
  if (!path) return null

  const objectMethod = path.findParent(
    (parent) => parent.isObjectMethod() && parent.node.key.name === "render",
  )
  if (objectMethod) return objectMethod

  const objectProperty = path.findParent(
    (parent) => parent.isObjectProperty() && parent.node.key.name === "render",
  )
  if (!objectProperty) return null

  const value = objectProperty.get("value")
  if (value.isFunctionExpression() || value.isArrowFunctionExpression()) {
    return value
  }

  return null
}

/**
 * Convert a JSXElement node into a lit-html template or component call.
 *
 * @param {import("@babel/types").JSXElement} node - The JSX element node.
 * @param {import("@babel/core").NodePath | null | undefined} path - The current path.
 * @param {boolean} [isSvg=false] - Whether the current subtree is inside SVG.
 * @returns {import("@babel/types").TaggedTemplateExpression | import("@babel/types").CallExpression} The transformed node.
 */
export function buildTemplate(node, path, isSvg = false) {
  const tag = node.openingElement.name.name
  let repeatKeyExpr = null
  let apiIdentifier = null

  if (isCapitalizedComponent(tag)) {
    const renderFn = findRenderFunction(path)

    if (renderFn) {
      ensureRenderApiParameter(renderFn)
      apiIdentifier = t.identifier("api")
    }

    const componentId = toCamelCase(tag)
    const props = []

    for (const attr of node.openingElement.attributes) {
      if (t.isJSXSpreadAttribute(attr)) {
        props.push(t.spreadElement(attr.argument))
        continue
      }

      const key = attr.name.name
      if (key === "key") {
        if (attr.value && t.isJSXExpressionContainer(attr.value)) {
          repeatKeyExpr = attr.value.expression
        }
        continue
      }

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

    const filteredChildren = node.children.filter(
      (child) => !(child.type === "JSXText" && child.value.trim() === ""),
    )

    if (filteredChildren.length) {
      const allChildPaths = getChildrenPaths(path)

      const filteredWithPaths = node.children
        .map((child, index) => ({ child, childPath: allChildPaths[index] }))
        .filter(
          ({ child }) =>
            !(child.type === "JSXText" && child.value.trim() === ""),
        )

      const fragmentNode = {
        children: filteredWithPaths.map((entry) => entry.child),
      }
      const fragmentPathLike = filteredWithPaths.length
        ? { get: () => filteredWithPaths.map((entry) => entry.childPath) }
        : null

      const childrenTemplate = buildFragment(
        fragmentNode,
        fragmentPathLike,
        isSvg,
      )
      props.push(t.objectProperty(t.identifier("children"), childrenTemplate))
    }

    const shouldLazyRegister =
      renderFn && !props.length && !filteredChildren.length

    if (shouldLazyRegister) {
      const renderCall = t.callExpression(
        t.memberExpression(t.identifier("api"), t.identifier("render")),
        [t.stringLiteral(componentId), t.stringLiteral(tag), t.identifier(tag)],
      )
      if (repeatKeyExpr) renderCall.__repeatKey = repeatKeyExpr
      return renderCall
    }

    if (path && path.scope.hasBinding(tag)) {
      const renderArgs = []
      const [onlyProp] = props
      const singleSpreadArg =
        props.length === LAST &&
        t.isSpreadElement(onlyProp) &&
        !filteredChildren.length

      if (singleSpreadArg) {
        renderArgs.push(onlyProp.argument)
      } else {
        renderArgs.push(
          props.length ? t.objectExpression(props) : t.objectExpression([]),
        )
      }

      if (apiIdentifier) {
        renderArgs.push(apiIdentifier)
      }

      const renderCall = t.callExpression(
        t.memberExpression(t.identifier(tag), t.identifier("render")),
        renderArgs,
      )
      if (repeatKeyExpr) renderCall.__repeatKey = repeatKeyExpr
      return renderCall
    }

    const renderCall = t.callExpression(
      t.memberExpression(t.identifier("api"), t.identifier("render")),
      props.length
        ? [t.stringLiteral(componentId), t.objectExpression(props)]
        : [t.stringLiteral(componentId)],
    )
    if (repeatKeyExpr) renderCall.__repeatKey = repeatKeyExpr
    return renderCall
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
      const prefix =
        name.includes("-") || name === "class" || name === "id" ? "" : "."
      quasis.push(tpl(`${text} ${prefix}${name}=`))
      exprs.push(value.expression)
      text = ""
      continue
    }

    text += ` ${name}="${value.value}"`
  }

  if (
    VOID_TAGS.includes(tag) ||
    (node.openingElement.selfClosing && isCurrentSvg)
  ) {
    text += " />"
    quasis.push(tpl(text, true))
    return createTemplateExpression(quasis, exprs)
  }

  if (node.openingElement.selfClosing) {
    text += `></${tag}>`
    quasis.push(tpl(text, true))
    return createTemplateExpression(quasis, exprs)
  }

  text += ">"

  const nextIsSvg = isCurrentSvg && tag !== "foreignObject"
  const childrenPaths = getChildrenPaths(path)

  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index]
    const childPath = childrenPaths[index]

    if (child.type === "JSXText") {
      text += child.value.replace(/\s+/g, " ")
      continue
    }

    if (child.type === "JSXExpressionContainer") {
      if (child.expression.type === "JSXEmptyExpression") continue
      quasis.push(tpl(text))
      exprs.push(child.expression)
      text = ""
      continue
    }

    const childTemplate =
      child.type === "JSXFragment"
        ? buildFragment(child, childPath, nextIsSvg)
        : buildTemplate(child, childPath, nextIsSvg)

    if (childTemplate.type === "TaggedTemplateExpression") {
      text = inlineChildTemplate(text, childTemplate, quasis, exprs)
      continue
    }

    quasis.push(tpl(text))
    exprs.push(childTemplate)
    text = ""
  }

  text += `</${tag}>`
  quasis.push(tpl(text, true))

  return createTemplateExpression(quasis, exprs)
}

/**
 * Convert a JSXFragment node into a lit-html template.
 *
 * @param {import("@babel/types").JSXFragment} node - The JSX fragment node.
 * @param {import("@babel/core").NodePath | null | undefined} path - The current path.
 * @param {boolean} [isSvg=false] - Whether the current subtree is inside SVG.
 * @returns {import("@babel/types").TaggedTemplateExpression} The transformed node.
 */
export function buildFragment(node, path, isSvg = false) {
  let text = ""
  const quasis = []
  const exprs = []

  const childrenPaths = getChildrenPaths(path)

  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index]
    const childPath = childrenPaths[index]

    if (child.type === "JSXText") {
      text += child.value.replace(/\s+/g, " ")
      continue
    }

    if (child.type === "JSXExpressionContainer") {
      if (child.expression.type === "JSXEmptyExpression") continue
      quasis.push(tpl(text))
      exprs.push(child.expression)
      text = ""
      continue
    }

    const childIsSvg =
      isSvg ||
      (child.type === "JSXElement" && child.openingElement.name.name === "svg")
    const childTemplate =
      child.type === "JSXFragment"
        ? buildFragment(child, childPath, childIsSvg)
        : buildTemplate(child, childPath, childIsSvg)

    if (childTemplate.type === "TaggedTemplateExpression") {
      text = inlineChildTemplate(text, childTemplate, quasis, exprs)
      continue
    }

    quasis.push(tpl(text))
    exprs.push(childTemplate)
    text = ""
  }

  quasis.push(tpl(text, true))

  return createTemplateExpression(quasis, exprs)
}
