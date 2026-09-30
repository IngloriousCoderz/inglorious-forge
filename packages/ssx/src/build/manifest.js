import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

const MANIFEST_FILE = ".ssx-manifest.json"

/**
 * Degraded page hasher used when no Vite server is available: hashes the page
 * module on its own, ignoring everything it imports.
 *
 * @param {Object} page - Page to hash.
 * @returns {Promise<string|null>} Hash of the page module.
 */
async function hashPageAlone(page) {
  return await hashFile(page.filePath)
}

const RUNTIME_FILES = [
  "../scripts/app.js",
  "./pages.js",
  "./vite-config.js",
  "../utils/i18n.js",
  "../router/index.js",
  "../render/index.js",
]

/**
 * Loads the build manifest from the previous build.
 *
 * @param {string} outDir - Output directory.
 * @returns {Promise<Object>} The manifest object.
 */
export async function loadManifest(outDir) {
  const manifestPath = path.join(outDir, MANIFEST_FILE)

  try {
    const content = await fs.readFile(manifestPath, "utf-8")
    return JSON.parse(content)
  } catch {
    // No manifest exists (first build or clean build)
    return { pages: {}, shared: null, runtime: null, buildTime: null }
  }
}

/**
 * Saves the build manifest for the next build.
 *
 * @param {string} outDir - Output directory.
 * @param {Object} manifest - The manifest to save.
 * @returns {Promise<void>}
 */
export async function saveManifest(outDir, manifest) {
  const manifestPath = path.join(outDir, MANIFEST_FILE)
  const content = JSON.stringify(manifest, null, 2)
  await fs.writeFile(manifestPath, content, "utf-8")
}

/**
 * Computes a hash for a file's contents.
 *
 * @param {string} filePath - Path to the file.
 * @returns {Promise<string|null>} Hash of the file or null if not found.
 */
export async function hashFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8")
    return crypto.createHash("md5").update(content).digest("hex")
  } catch {
    return null
  }
}

/**
 * Source files that affect every page but are not reachable from any page
 * module, so the per-page dependency graph cannot see them.
 *
 * `entities` and `types` are loaded directly by `getStoreStuff`, and the site
 * config supplies the layout that wraps every rendered page.
 */
const SHARED_SOURCES = [
  ["src", "store", "entities"],
  ["src", "store", "types"],
  ["src", "site.config"],
]

const SOURCE_EXTENSIONS = ["js", "ts", "mjs", "cjs"]

/**
 * Computes a hash over the source files that every page depends on but cannot
 * reach through its own imports: store entities, store types, and the site
 * config. When this changes, page HTML must be regenerated even if no page
 * module changed.
 *
 * @param {string} rootDir - Project root directory (the parent of `src`).
 * @returns {Promise<string>} Hash of the shared sources.
 */
export async function hashSharedSources(rootDir) {
  const parts = []

  for (const segments of SHARED_SOURCES) {
    const base = path.join(rootDir, ...segments)

    for (const extension of SOURCE_EXTENSIONS) {
      const filePath = `${base}.${extension}`
      const hash = await hashFile(filePath)

      if (hash !== null) {
        parts.push(`${filePath}:${hash}`)
      }
    }
  }

  return crypto.createHash("md5").update(parts.join("\n")).digest("hex")
}

/**
 * Computes a hash for SSX runtime internals.
 * When this changes, page HTML should be regenerated even if source pages did not change.
 *
 * @returns {Promise<string>} Hash of runtime internals.
 */
export async function hashRuntime() {
  const root = import.meta.dirname
  const contents = await Promise.all(
    RUNTIME_FILES.map(async (relativePath) => {
      const filePath = path.resolve(root, relativePath)
      const content = await fs.readFile(filePath, "utf-8")
      return `${relativePath}:${content}`
    }),
  )

  return crypto.createHash("md5").update(contents.join("\n")).digest("hex")
}

/**
 * Determines whether a module id refers to a real source file that should take
 * part in change detection.
 *
 * Virtual modules (Vite internals, `\0`-prefixed) and anything installed under
 * `node_modules` are excluded: they are not the site's own source, and
 * pre-bundled dependency ids are not stable between installs.
 *
 * @param {string|null|undefined} id - Module id from the Vite module graph.
 * @returns {boolean} True if the module should be hashed.
 */
function isTrackableModule(id) {
  if (!id || typeof id !== "string") return false
  if (id.startsWith("\0")) return false
  if (!path.isAbsolute(id)) return false
  if (id.split(path.sep).includes("node_modules")) return false

  return true
}

/**
 * Collects every source file a page depends on, following the Vite module graph
 * so that changes to shared partials (components, nested types, styles, data)
 * invalidate the pages that render them.
 *
 * Falls back to the page module alone when the graph has no entry for it, so
 * change detection degrades to the previous behaviour instead of to nothing.
 *
 * @param {string} filePath - Path to the page module.
 * @param {import("vite").ViteDevServer} [vite] - Vite server holding the module graph.
 * @returns {Array<string>} Sorted, de-duplicated list of dependency file paths.
 */
export function collectPageDependencies(filePath, vite) {
  const root = vite?.moduleGraph?.getModuleById(filePath)
  const dependencies = new Set([filePath])
  const visited = new Set()
  const stack = root ? [root] : []

  while (stack.length) {
    const node = stack.pop()

    if (visited.has(node)) continue
    visited.add(node)

    if (isTrackableModule(node.id)) {
      dependencies.add(node.id)
    }

    for (const imported of node.importedModules) {
      stack.push(imported)
    }
  }

  return [...dependencies].sort()
}

/**
 * Creates a page hasher that folds a page's whole dependency graph into a
 * single hash. File contents are read at most once per build, so pages sharing
 * a partial do not re-read it.
 *
 * @param {import("vite").ViteDevServer} [vite] - Vite server holding the module graph.
 * @returns {(page: Object) => Promise<string>} Function producing a page hash.
 */
export function createPageHasher(vite) {
  const contents = new Map()

  const hashOnce = async (filePath) => {
    if (!contents.has(filePath)) {
      contents.set(filePath, await hashFile(filePath))
    }

    return contents.get(filePath)
  }

  return async (page) => {
    const dependencies = collectPageDependencies(page.filePath, vite)
    const parts = await Promise.all(
      dependencies.map(
        async (filePath) => `${filePath}:${await hashOnce(filePath)}`,
      ),
    )

    return crypto.createHash("md5").update(parts.join("\n")).digest("hex")
  }
}

/**
 * Determines which pages need to be rebuilt.
 * Compares current dependency hashes against the manifest.
 *
 * @param {Array<Object>} pages - All pages to potentially build.
 * @param {Object} manifest - Previous build manifest.
 * @param {string} sharedHash - Current hash of the shared sources.
 * @param {string} runtimeHash - Current SSX runtime hash.
 * @param {(page: Object) => Promise<string>} [getPageHash=hashPageAlone] - Produces a page's hash.
 * @returns {Promise<{pagesToBuild: Array<Object>, pagesToSkip: Array<Object>}>} Object with pagesToBuild and pagesSkipped.
 */
export async function determineRebuildPages(
  pages,
  manifest,
  sharedHash,
  runtimeHash,
  getPageHash = hashPageAlone,
) {
  // If shared sources changed, rebuild all pages
  if (manifest.shared !== sharedHash) {
    console.log("📦 Shared sources changed, rebuilding all pages\n")
    return { pagesToBuild: pages, pagesToSkip: [] }
  }

  if (manifest.runtime !== runtimeHash) {
    console.log("🔁 SSX runtime changed, rebuilding all pages\n")
    return { pagesToBuild: pages, pagesToSkip: [] }
  }

  const pagesToBuild = []
  const pagesToSkip = []

  for (const page of pages) {
    const currentHash = await getPageHash(page)
    const previousHash = manifest.pages[page.path]?.hash

    if (currentHash !== previousHash) {
      pagesToBuild.push(page)
    } else {
      pagesToSkip.push(page)
    }
  }

  return { pagesToBuild, pagesToSkip }
}

/**
 * Creates a new manifest from build results.
 *
 * @param {Array<Object>} renderedPages - All rendered pages.
 * @param {string} sharedHash - Hash of the shared sources.
 * @param {string} runtimeHash - Hash of SSX runtime internals.
 * @param {(page: Object) => Promise<string>} [getPageHash=hashPageAlone] - Produces a page's hash.
 * @returns {Promise<Object>} New manifest.
 */
export async function createManifest(
  renderedPages,
  sharedHash,
  runtimeHash,
  getPageHash = hashPageAlone,
) {
  const pages = {}

  for (const page of renderedPages) {
    pages[page.path] = {
      hash: await getPageHash(page),
      filePath: page.filePath,
    }
  }

  return {
    pages,
    shared: sharedHash,
    runtime: runtimeHash,
    buildTime: new Date().toISOString(),
  }
}
