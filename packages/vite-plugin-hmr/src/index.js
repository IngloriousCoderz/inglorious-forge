// @inglorious/vite-plugin-hmr/index.js
import { readFileSync } from "node:fs"

import { parse as parseBabel } from "@babel/parser"
import MagicString from "magic-string"

/**
 * Creates the Vite plugin that adds Hot Module Reloading support for
 * apps built with @inglorious/web.
 *
 * Two independent HMR boundaries are set up:
 *
 * 1. Individual type files (e.g. Footer.js) get their own self-accept
 *    that patches the running store in place via `store.setType()`.
 *    The running store instance is looked up through a global registry
 *    (`globalThis.__INGLORIOUS_HMR_STORE__`) rather than imported —
 *    importing store.js from a type file would create a circular import
 *    (store.js -> types -> this file -> store.js), and Vite forces a
 *    full page reload for any HMR update touching a circular import, which
 *    would silently defeat this entire boundary.
 * 2. The app's `mount(store, render, element)` call is the fallback
 *    boundary for everything else (entities seed data, store config) —
 *    recreate the store, restore its state, except when the change comes
 *    from the seed itself.
 *
 * Both are best-effort: anything that can't be resolved statically
 * (dynamic type registries, computed properties, non-literal configs)
 * simply doesn't get the optimization — it falls through to the next
 * boundary up, down to a plain full reload in the worst case. Never a
 * hard failure.
 *
 * @returns {import("vite").Plugin}
 */
export function hmr() {
  let isServe = false
  let seedFilePath = null
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

      seedFilePath = storeFilePath
        ? await resolveSeedFile(this, storeFilePath)
        : null

      typeFileMap = storeFilePath
        ? await resolveTypeFiles(this, storeFilePath)
        : new Map()

      return rewrite(code, mountCall, Boolean(seedFilePath))
    },

    // Runs server-side, once per changed file, with the actual file path
    // Vite detected on disk — used only for the mount()-level boundary;
    // type files handle their own updates via self-accept.
    handleHotUpdate(ctx) {
      if (seedFilePath && ctx.file === seedFilePath) {
        ctx.server.ws.send({ type: "custom", event: "inglorious:seed-changed" })
      }
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
        return specifier.local.name // handles `import { mount as m }` too
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

/**
 * Like a plain "find the import source for this local name" lookup, but
 * also returns the *exported* name from the source module — needed
 * because the local binding name and the actual export name can differ
 * (aliased imports, default imports).
 */
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

/**
 * Finds `createStore({ ..., [propName]: identifier, ... })` in a top-level
 * variable declaration and returns the identifier's local name — only if
 * the value is a plain identifier. Returns null for object literals,
 * spreads, computed keys, or anything else that can't be traced to an
 * import statically.
 */
function findConfigPropertyIdentifier(ast, createStoreLocalName, propName) {
  const value = findConfigPropertyValue(ast, createStoreLocalName, propName)
  return value?.type === "Identifier" ? value.name : null
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
 * Resolves which file's changes should skip the HMR state restore for the
 * mount()-level boundary. Tries the dedicated entities file first, falls
 * back to the whole store module if entities is inline or unresolvable.
 */
async function resolveSeedFile(pluginContext, storeFileId) {
  const entitiesFile = await resolveEntitiesFile(pluginContext, storeFileId)
  return entitiesFile ?? storeFileId
}

async function resolveEntitiesFile(pluginContext, storeFileId) {
  const storeAst = parseFile(pluginContext, storeFileId)
  if (!storeAst) return null

  const createStoreLocalName = findImportName(
    storeAst,
    "@inglorious/store",
    "createStore",
  )
  if (!createStoreLocalName) return null

  const entitiesLocalName = findConfigPropertyIdentifier(
    storeAst,
    createStoreLocalName,
    "entities",
  )
  if (!entitiesLocalName) return null

  const importInfo = findImportInfoForLocal(storeAst, entitiesLocalName)
  if (!importInfo) return null

  const resolved = await pluginContext.resolve(importInfo.source, storeFileId)
  return resolved?.id ?? null
}

/**
 * Resolves the individual type files behind createStore({ types }), so
 * each one can become its own HMR boundary.
 *
 * @returns {Promise<Map<string, { typeName: string, exportName: string }>>}
 *   Keyed by each type file's resolved absolute path.
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

/**
 * Finds `export const <exportName> = { key: value, ... }` (or the default
 * export equivalent) and returns [key, localValueName] pairs for
 * properties whose value is a plain identifier.
 */
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

/**
 * Injects a self-accept boundary into a type file. Deliberately does NOT
 * import the store module — see the module-level doc comment for why.
 * Looks up the running store through a global registry instead, which the
 * mount()-level rewrite populates.
 */
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

function rewrite(code, mountCall, hasSeedFile) {
  const s = new MagicString(code)
  const [storeArg, renderArg, elementArg, optionsArg] = mountCall.arguments

  const storeSrc = code.slice(storeArg.start, storeArg.end)
  const renderSrc = code.slice(renderArg.start, renderArg.end)
  const elementSrc = code.slice(elementArg.start, elementArg.end)
  const optionsSrc = optionsArg
    ? code.slice(optionsArg.start, optionsArg.end)
    : "{}"

  const seedTracking = hasSeedFile
    ? `
let __hmrPendingSkipRestore = false
if (import.meta.hot) {
  import.meta.hot.on("inglorious:seed-changed", () => {
    __hmrPendingSkipRestore = true
  })
}
`
    : ""

  s.appendLeft(
    mountCall.start,
    `const __hmrStore = ${storeSrc}
const __hmrRender = ${renderSrc}
const __hmrElement = ${elementSrc}
${seedTracking}
const __hmrAlreadyMounted = Boolean(import.meta.hot?.data?.mounted)
const __hmrRestoredState = import.meta.hot?.data?.state
const __hmrSkipRestore = Boolean(import.meta.hot?.data?.skipRestore)
if (__hmrRestoredState && !__hmrSkipRestore) __hmrStore.setState(__hmrRestoredState)

`,
  )

  s.overwrite(
    mountCall.start,
    mountCall.end,
    `mount(__hmrStore, __hmrRender, __hmrElement, { ...(${optionsSrc}), hydrate: !__hmrAlreadyMounted })`,
  )

  s.appendRight(
    mountCall.end,
    `

if (import.meta.hot) {
  globalThis.__INGLORIOUS_HMR_STORE__ = __hmrStore
  import.meta.hot.data.mounted = true
  import.meta.hot.dispose((data) => {
    data.mounted = true
    data.state = __hmrStore.getState()
    data.skipRestore = ${hasSeedFile ? "__hmrPendingSkipRestore" : "false"}
  })
  import.meta.hot.accept()
}`,
  )

  return { code: s.toString(), map: s.generateMap({ hires: true }) }
}
