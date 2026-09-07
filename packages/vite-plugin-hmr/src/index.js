import { readFileSync } from "node:fs"

import MagicString from "magic-string"

/**
 * Creates the Vite plugin that adds Hot Module Reloading support for
 * apps built with @inglorious/web.
 *
 * It finds the app's `mount(store, render, element)` call and rewrites it
 * to preserve store state across hot updates, except when the change comes
 * from whatever seeds the store's initial entities — in that case, a fresh
 * start is the correct behavior, so the previous state is not restored.
 *
 * @returns {import("vite").Plugin}
 */
export function hmr() {
  let isServe = false
  /** Absolute path of the file whose changes should NOT trigger a state
   *  restore (the store's seed data). Resolved once, during transform of
   *  the entry file. Null if it couldn't be determined statically — in
   *  that case the plugin always restores state, which is the safe default. */
  let seedFilePath = null

  return {
    name: "@inglorious/vite-plugin-hmr",

    configResolved(config) {
      isServe = config.command === "serve"
    },

    async transform(code, id) {
      if (!isServe) return null
      if (!/\.[jt]sx?$/.test(id)) return null
      if (!code.includes("@inglorious/web")) return null // cheap bail before parsing

      const ast = this.parse(code)

      const mountLocalName = findImportName(ast, "@inglorious/web", "mount")
      if (!mountLocalName) return null

      const mountCall = findTopLevelMountCall(ast, mountLocalName)
      if (!mountCall) return null

      seedFilePath = await resolveSeedFile(this, ast, mountCall, id)

      return rewrite(code, mountCall, Boolean(seedFilePath))
    },

    // Runs server-side, once per changed file, with the actual file path
    // Vite detected on disk — no ambiguity about which file this is,
    // unlike the client-side HMR payload (see note below).
    handleHotUpdate(ctx) {
      if (seedFilePath && ctx.file === seedFilePath) {
        ctx.server.ws.send({ type: "custom", event: "inglorious:seed-changed" })
      }
      // Returning nothing lets Vite's normal HMR propagation continue
      // unchanged; this hook only adds a side-channel notification.
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

function findImportSourceForLocal(ast, localName) {
  for (const node of ast.body) {
    if (node.type !== "ImportDeclaration") continue
    for (const specifier of node.specifiers) {
      if (specifier.local.name === localName) return node.source.value
    }
  }
  return null
}

/**
 * Resolves which file's changes should skip the HMR state restore.
 *
 * Tries, in order:
 *  1. The specific file `entities` is imported from, if `store.js` calls
 *     createStore({ ..., entities, ... }) with `entities` as an imported
 *     identifier (the common case — a dedicated entities.js file).
 *  2. The store module itself (`store.js`), if `entities` can't be traced
 *     to an external import — covers inline seed data, e.g.
 *     createStore({ entities: { ... } }).
 *  3. null, if even the store module can't be resolved — disables this
 *     feature entirely rather than guessing wrong.
 */
async function resolveSeedFile(pluginContext, mainAst, mountCall, mainId) {
  const [storeArg] = mountCall.arguments
  if (storeArg?.type !== "Identifier") return null

  const storeImportSource = findImportSourceForLocal(mainAst, storeArg.name)
  if (!storeImportSource) return null

  const resolvedStore = await pluginContext.resolve(storeImportSource, mainId)
  if (!resolvedStore) return null

  const entitiesFile = await resolveEntitiesFile(
    pluginContext,
    resolvedStore.id,
  )

  return entitiesFile ?? resolvedStore.id
}

/**
 * Attempts step 1 above: find createStore({ entities }) inside the store
 * module and resolve the file `entities` comes from. Returns null if the
 * call, the property, or the import can't be found statically — the
 * caller falls back to watching the store module as a whole.
 */
async function resolveEntitiesFile(pluginContext, storeFileId) {
  let storeCode
  try {
    storeCode = readFileSync(storeFileId, "utf-8")
  } catch {
    return null
  }

  const storeAst = pluginContext.parse(storeCode)

  const createStoreLocalName = findImportName(
    storeAst,
    "@inglorious/store",
    "createStore",
  )
  if (!createStoreLocalName) return null

  const entitiesLocalName = findEntitiesArgName(storeAst, createStoreLocalName)
  if (!entitiesLocalName) return null

  const entitiesImportSource = findImportSourceForLocal(
    storeAst,
    entitiesLocalName,
  )
  if (!entitiesImportSource) return null

  const resolvedEntities = await pluginContext.resolve(
    entitiesImportSource,
    storeFileId,
  )
  return resolvedEntities?.id ?? null
}

/**
 * Finds `createStore({ ..., entities, ... })` in a top-level variable
 * declaration (including `export const store = createStore(...)`) and
 * returns the local name bound to its `entities` property — only if that
 * value is an identifier (imported or locally defined). Returns null for
 * anything else (inline object literal, spread, computed key, etc.),
 * which is exactly the signal the caller uses to fall back to watching
 * the whole store module instead.
 */
function findEntitiesArgName(ast, createStoreLocalName) {
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
        if (keyName === "entities" && prop.value.type === "Identifier") {
          return prop.value.name
        }
      }
    }
  }
  return null
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
