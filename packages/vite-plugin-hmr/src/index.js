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
      if (!/\.[jt]sx?$/.test(id)) return null

      if (typeFileMap.has(id)) {
        return rewriteTypeModule(code, typeFileMap.get(id))
      }

      if (!code.includes("@inglorious/web")) return null

      const ast = parseCode(this, code)

      const mountLocalName = findImportName(ast, "@inglorious/web", "mount")
      if (!mountLocalName) return null

      const mountCall = findTopLevelMountCall(ast, mountLocalName)
      if (!mountCall) return null

      const [storeArg] = mountCall.arguments
      const storeFilePath =
        storeArg?.type === "Identifier"
          ? await resolveStoreFilePath(this, ast, storeArg.name, id)
          : null

      typeFileMap = storeFilePath
        ? await resolveTypeFiles(this, storeFilePath)
        : new Map()

      if (storeArg?.type !== "Identifier") return null

      return registerStoreGlobally(code, mountCall)
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

function findTopLevelMountCall(ast, mountLocalName) {
  for (const node of ast.body) {
    const expr = node.type === "ExpressionStatement" ? node.expression : null
    if (
      expr?.type === "CallExpression" &&
      expr.callee.type === "Identifier" &&
      expr.callee.name === mountLocalName
    ) {
      return expr
    }
  }
  return null
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

      const [configArg] = init.arguments
      if (configArg?.type !== "ObjectExpression") continue

      for (const prop of configArg.properties) {
        if (prop.type !== "Property") continue
        const keyName = prop.key.name ?? prop.key.value
        if (keyName === propName) return prop.value
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
      objectExpr = node.declaration
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
          objectExpr = declarator.init
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
function registerStoreGlobally(code, mountCall) {
  const [storeArg] = mountCall.arguments
  const storeSrc = code.slice(storeArg.start, storeArg.end)

  const s = new MagicString(code)
  s.appendLeft(
    mountCall.start,
    `if (import.meta.hot) globalThis.__INGLORIOUS_HMR_STORE__ = ${storeSrc}

`,
  )

  return { code: s.toString(), map: s.generateMap({ hires: true }) }
}
