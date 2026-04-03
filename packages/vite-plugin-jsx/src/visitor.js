import { types as t } from "@babel/core"

import { buildFragment, buildTemplate } from "./render.js"
import { createImportSpecifier, isJsx } from "./utils.js"

const IMPORT_SOURCE = "@inglorious/web"

/**
 * Add the `@inglorious/web` imports required by a transformed file.
 *
 * @param {import("@babel/core").NodePath} path - The Program path being finalized.
 */
function ensureWebImports(path) {
  const needed = new Set()

  if (path.__needsHtml) needed.add("html")
  if (path.__needsWhen) needed.add("when")
  if (path.__needsRepeat) needed.add("repeat")

  if (!needed.size) return

  let importDecl = null

  path.get("body").forEach((nodePath) => {
    if (
      nodePath.isImportDeclaration() &&
      nodePath.node.source.value === IMPORT_SOURCE
    ) {
      if (nodePath.node.importKind !== "type") {
        importDecl = nodePath
      }

      for (const specifier of nodePath.get("specifiers")) {
        if (
          specifier.isImportSpecifier() &&
          nodePath.node.importKind !== "type"
        ) {
          needed.delete(specifier.node.imported.name)
        }
      }
    }
  })

  const specifiersToAdd = [...needed].map(createImportSpecifier)

  if (!specifiersToAdd.length) return

  if (importDecl) {
    importDecl.pushContainer("specifiers", specifiersToAdd)
    return
  }

  path.unshiftContainer(
    "body",
    t.importDeclaration(specifiersToAdd, t.stringLiteral(IMPORT_SOURCE)),
  )
}

/**
 * Build the Babel visitor that rewrites JSX into lit-html calls.
 *
 * @returns {import("@babel/core").PluginObj} The Babel plugin object.
 */
export function jsxToLit() {
  return {
    visitor: {
      Program: {
        enter(path) {
          path.__needsHtml = false
          path.__needsWhen = false
          path.__needsRepeat = false
        },
        exit(path) {
          ensureWebImports(path)
        },
      },

      JSXElement(path) {
        path.findParent((parent) => parent.isProgram()).__needsHtml = true
        path.replaceWith(buildTemplate(path.node, path))
      },

      JSXFragment(path) {
        path.findParent((parent) => parent.isProgram()).__needsHtml = true
        path.replaceWith(buildFragment(path.node, path))
      },

      ConditionalExpression(path) {
        const { test, consequent, alternate } = path.node
        if (isJsx(consequent) || isJsx(alternate)) {
          path.findParent((parent) => parent.isProgram()).__needsWhen = true
          path.replaceWith(
            t.callExpression(t.identifier("when"), [
              test,
              t.arrowFunctionExpression([], consequent),
              t.arrowFunctionExpression([], alternate),
            ]),
          )
        }
      },

      LogicalExpression(path) {
        if (path.node.operator === "&&" && isJsx(path.node.right)) {
          path.findParent((parent) => parent.isProgram()).__needsWhen = true
          path.replaceWith(
            t.callExpression(t.identifier("when"), [
              path.node.left,
              t.arrowFunctionExpression([], path.node.right),
            ]),
          )
        }
      },

      CallExpression(path) {
        const { callee, arguments: args } = path.node
        const [arrow] = args
        const body = arrow && arrow.body
        const isRenderableBody =
          (body && isJsx(body)) ||
          (t.isCallExpression(body) &&
            t.isMemberExpression(body.callee) &&
            body.callee.property.name === "render")

        if (
          t.isMemberExpression(callee) &&
          callee.property.name === "map" &&
          t.isArrowFunctionExpression(arrow) &&
          isRenderableBody
        ) {
          if (
            !path.findParent(
              (parent) =>
                parent.isJSXExpressionContainer() || parent.isReturnStatement(),
            )
          ) {
            return
          }

          path.findParent((parent) => parent.isProgram()).__needsRepeat = true

          const items = callee.object
          const repeatArgs = [items]

          let keyExpr = null
          if (t.isJSXElement(body)) {
            const keyAttr = body.openingElement.attributes.find(
              (attr) => attr.name && attr.name.name === "key",
            )

            if (keyAttr && keyAttr.value.type === "JSXExpressionContainer") {
              keyExpr = keyAttr.value.expression
            }
          } else if (body && body.__repeatKey) {
            keyExpr = body.__repeatKey
          }

          if (keyExpr) {
            repeatArgs.push(t.arrowFunctionExpression(arrow.params, keyExpr))
          }

          repeatArgs.push(arrow)

          path.replaceWith(t.callExpression(t.identifier("repeat"), repeatArgs))
        }
      },
    },
  }
}
