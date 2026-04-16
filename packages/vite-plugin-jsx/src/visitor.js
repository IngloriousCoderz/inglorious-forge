import { types as t } from "@babel/core"

import { buildFragment, buildTemplate } from "./render.js"
import { createImportSpecifier, isJsx } from "./utils.js"

const IMPORT_SOURCES = {
  html: "@inglorious/web",
  when: "@inglorious/web/directives/when",
  repeat: "@inglorious/web/directives/repeat",
}

/**
 * Add the `@inglorious/web` imports required by a transformed file.
 *
 * @param {import("@babel/core").NodePath} path - The Program path being finalized.
 */
function ensureWebImports(path) {
  const needed = {
    html: path.__needsHtml,
    when: path.__needsWhen,
    repeat: path.__needsRepeat,
  }

  const importDecls = { html: null, when: null, repeat: null }

  path.get("body").forEach((nodePath) => {
    if (!nodePath.isImportDeclaration() || nodePath.node.importKind === "type")
      return

    const name = Object.keys(IMPORT_SOURCES).find(
      (key) => IMPORT_SOURCES[key] === nodePath.node.source.value,
    )

    if (name) {
      importDecls[name] = nodePath
      nodePath.get("specifiers").forEach((specifier) => {
        if (
          specifier.isImportSpecifier() &&
          specifier.node.imported.name === name
        ) {
          needed[name] = false
        }
      })
    }
  })

  Object.keys(IMPORT_SOURCES).forEach((name) => {
    if (!needed[name]) return

    const specifier = createImportSpecifier(name)
    if (importDecls[name]) {
      importDecls[name].pushContainer("specifiers", [specifier])
    } else {
      path.unshiftContainer(
        "body",
        t.importDeclaration([specifier], t.stringLiteral(IMPORT_SOURCES[name])),
      )
    }
  })
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
