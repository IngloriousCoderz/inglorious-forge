import { readFileSync } from "node:fs"

import { parse as parseBabel } from "@babel/parser"
import MagicString from "magic-string"

/**
 * Creates the Vite plugin that adds Hot Module Reloading support for
 * apps built with @inglorious/web.
 *
 * Individual type files (e.g. Footer.js) get their own self-accept that
 * patches the running store in place via `store.setType()` — no store
 * recreation, no state loss, because nothing was ever torn down. The
 * running store instance is looked up through a global registry
 * (`globalThis.__INGLORIOUS_HMR_STORE__`) rather than imported —
 * importing store.js from a type file would create a circular import,
 * and Vite forces a full page reload for any HMR update touching a
 * circular import, silently defeating this boundary.
 *
 * Anything that isn't a resolved type file (entities.js, store.js
 * itself, the types index, or anything unresolvable statically) has no
 * dedicated boundary and simply falls through to Vite's own default: a
 * full page reload. That's the correct outcome for those files anyway —
 * they define what a fresh session should look like, so a fresh session
 * (a reload) is exactly right, and it comes for free without any restore
 * machinery to get wrong.
 *
 * @returns {import("vite").Plugin}
 */
export function hmr() {
  let isServe = false
  /** @type {Map<string, { typeName: string, exportName: string }>} */
  let typeFileMap = new Map()

  return {
    name: "@inglorious/vite-plugin-hmr",

    configResolved(config) {
      isServe = config.command === "serve"
    },

    async transform(code, id) {
      if (!isServe) return null
      if (!/\.([jt]sx?|vue)$/.test(id)) return null

      if (typeFileMap.has(id)) {
        return rewriteTypeModule(code, typeFileMap.get(id))
      }

      if (!code.includes("@inglorious/web")) return null

      const ast = parseCode(this, code)

      const mountLocalName = findImportName(ast, "@inglorious/web", "mount")
      if (!mountLocalName) return null

      const mount = findMountCall(ast, mountLocalName)
      if (!mount) return null

      const [storeArg] = mount.call.arguments
      const store = findStoreIdentifier(storeArg)
      const storeFilePath = store
        ? await resolveStoreFilePath(this, ast, store.name, id)
        : null

      typeFileMap = storeFilePath
        ? await resolveTypeFiles(this, storeFilePath)
        : new Map()

      if (!store) return null
      if (mount.isNested && !findImportInfoForLocal(ast, store.name)) {
        return null
      }

      return registerStoreGlobally(code, mount.statement, store)
    },
  }
}

function findImportName(ast, source, importedName) {
  for (const node of ast.body) {
    if (node.type !== "ImportDeclaration") continue
    if (node.source.value !== source) continue
    for (const specifier of node.specifiers) {
      if (
        specifier.type === "ImportSpecifier" &&
        specifier.imported.name === importedName
      ) {
        return specifier.local.name
      }
    }
  }
  return null
}

/**
 * Finds the mount() call: a top-level statement, or a call nested in one,
 * such as \`ready.then(() => mount(...))\`.
 *
 * @returns {{ call: object, statement: object, isNested: boolean } | null}
 */
function findMountCall(ast, mountLocalName) {
  for (const statement of ast.body) {
    const call = findCall(statement, mountLocalName)
    if (call) {
      const isNested =
        statement.type !== "ExpressionStatement" ||
        statement.expression !== call
      return { call, statement, isNested }
    }
  }
  return null
}

function findCall(node, calleeName) {
  if (!node || typeof node.type !== "string") return null
  if (
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === calleeName
  ) {
    return node
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "range") continue
    const children = Array.isArray(value) ? value : [value]
    for (const child of children) {
      if (child && typeof child === "object") {
        const call = findCall(child, calleeName)
        if (call) return call
      }
    }
  }
  return null
}

/**
 * The store passed to mount(): the identifier itself, or the one a store
 * wrapper is given, as in \`withLogging(store)\`. Anything else, such as
 * \`createStore({ ... })\`, has no store to register without evaluating it
 * twice.
 */
function findStoreIdentifier(node) {
  const expr = unwrapTypeScript(node)
  if (expr?.type === "Identifier") return expr
  if (expr?.type === "CallExpression") {
    const [wrapped] = expr.arguments
    return findStoreIdentifier(wrapped)
  }
  return null
}

function unwrapTypeScript(node) {
  let expr = node
  while (
    expr?.type === "TSAsExpression" ||
    expr?.type === "TSSatisfiesExpression" ||
    expr?.type === "TSNonNullExpression" ||
    expr?.type === "TSTypeAssertion"
  ) {
    expr = expr.expression
  }
  return expr
}

function findImportInfoForLocal(ast, localName) {
  for (const node of ast.body) {
    if (node.type !== "ImportDeclaration") continue
    for (const specifier of node.specifiers) {
      if (specifier.local.name !== localName) continue
      if (specifier.type === "ImportDefaultSpecifier") {
        return { source: node.source.value, exportName: "default" }
      }
      if (specifier.type === "ImportSpecifier") {
        return {
          source: node.source.value,
          exportName: specifier.imported.name,
        }
      }
    }
  }
  return null
}

function parseFile(pluginContext, fileId) {
  let code
  try {
    code = readFileSync(fileId, "utf-8")
  } catch {
    return null
  }
  try {
    return parseCode(pluginContext, code)
  } catch {
    return null
  }
}

function parseCode(pluginContext, code) {
  try {
    return pluginContext.parse(code)
  } catch {
    return parseBabel(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "estree"],
    }).program
  }
}

async function resolveStoreFilePath(
  pluginContext,
  mainAst,
  storeLocalName,
  mainId,
) {
  const importInfo = findImportInfoForLocal(mainAst, storeLocalName)
  if (!importInfo) return null

  const resolved = await pluginContext.resolve(importInfo.source, mainId)
  return resolved?.id ?? null
}

function findConfigPropertyValue(ast, createStoreLocalName, propName) {
  for (const node of ast.body) {
    const decl =
      node.type === "ExportNamedDeclaration" ? node.declaration : node
    if (decl?.type !== "VariableDeclaration") continue

    for (const declarator of decl.declarations) {
      const init = declarator.init
      if (
        init?.type !== "CallExpression" ||
        init.callee.type !== "Identifier" ||
        init.callee.name !== createStoreLocalName
      ) {
        continue
      }

      const [configNode] = init.arguments
      const configArg = unwrapTypeScript(configNode)
      if (configArg?.type !== "ObjectExpression") continue

      for (const prop of configArg.properties) {
        if (prop.type !== "Property") continue
        const keyName = prop.key.name ?? prop.key.value
        if (keyName === propName) return unwrapTypeScript(prop.value)
      }
    }
  }
  return null
}

/**
 * Resolves the individual type files behind createStore({ types }), so
 * each one can become its own HMR boundary.
 *
 * @returns {Promise<Map<string, { typeName: string, exportName: string }>>}
 */
async function resolveTypeFiles(pluginContext, storeFileId) {
  const map = new Map()

  const storeAst = parseFile(pluginContext, storeFileId)
  if (!storeAst) return map

  const createStoreLocalName = findImportName(
    storeAst,
    "@inglorious/store",
    "createStore",
  )
  if (!createStoreLocalName) return map

  const typesValue = findConfigPropertyValue(
    storeAst,
    createStoreLocalName,
    "types",
  )
  if (!typesValue) return map

  let typesAst
  let typesFileId
  let entries

  if (typesValue.type === "Identifier") {
    const typesImportInfo = findImportInfoForLocal(storeAst, typesValue.name)
    if (!typesImportInfo) return map

    const resolvedTypesFile = await pluginContext.resolve(
      typesImportInfo.source,
      storeFileId,
    )
    if (!resolvedTypesFile) return map

    typesFileId = resolvedTypesFile.id
    typesAst = parseFile(pluginContext, typesFileId)
    if (!typesAst) return map
    entries = findExportedObjectEntries(typesAst, typesImportInfo.exportName)
  } else if (typesValue.type === "ObjectExpression") {
    typesAst = storeAst
    typesFileId = storeFileId
    entries = findObjectEntries(typesValue)
  } else {
    return map
  }

  for (const [typeName, localName] of entries) {
    const importInfo = findImportInfoForLocal(typesAst, localName)
    if (!importInfo) continue

    const resolvedTypeFile = await pluginContext.resolve(
      importInfo.source,
      typesFileId,
    )
    if (!resolvedTypeFile) continue

    map.set(resolvedTypeFile.id, {
      typeName,
      exportName: importInfo.exportName,
    })
  }

  return map
}

function findExportedObjectEntries(ast, exportName) {
  for (const node of ast.body) {
    let objectExpr = null

    if (exportName === "default" && node.type === "ExportDefaultDeclaration") {
      objectExpr = unwrapTypeScript(node.declaration)
    }

    if (
      node.type === "ExportNamedDeclaration" &&
      node.declaration?.type === "VariableDeclaration"
    ) {
      for (const declarator of node.declaration.declarations) {
        if (
          declarator.id.type === "Identifier" &&
          declarator.id.name === exportName
        ) {
          objectExpr = unwrapTypeScript(declarator.init)
        }
      }
    }

    if (objectExpr?.type === "ObjectExpression") {
      return findObjectEntries(objectExpr)
    }
  }
  return []
}

function findObjectEntries(objectExpr) {
  return objectExpr.properties
    .filter(
      (prop) => prop.type === "Property" && prop.value.type === "Identifier",
    )
    .map((prop) => [prop.key.name ?? prop.key.value, prop.value.name])
}

function rewriteTypeModule(code, typeInfo) {
  const { typeName, exportName } = typeInfo
  const s = new MagicString(code)

  s.append(`

if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    const nextType = mod?.[${JSON.stringify(exportName)}]
    const store = globalThis.__INGLORIOUS_HMR_STORE__
    if (nextType && store) store.setType(${JSON.stringify(typeName)}, nextType)
  })
}
`)

  return { code: s.toString(), map: s.generateMap({ hires: true }) }
}

/**
 * Registers the running store instance globally, so type files can find
 * it without importing store.js (which would create a circular import).
 * Deliberately does NOT touch the mount() call itself — no self-accept,
 * no options injected, no rewritten arguments. main.js is not an HMR
 * boundary anymore; anything that reaches it falls through to a plain
 * full reload, which is the correct outcome for structural changes.
 */
function registerStoreGlobally(code, mountStatement, store) {
  const s = new MagicString(code)
  s.appendLeft(
    mountStatement.start,
    `if (import.meta.hot) globalThis.__INGLORIOUS_HMR_STORE__ = ${store.name}

`,
  )

  return { code: s.toString(), map: s.generateMap({ hires: true }) }
}
