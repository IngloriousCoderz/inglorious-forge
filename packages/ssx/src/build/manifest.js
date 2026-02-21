import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

const MANIFEST_FILE = ".ssx-manifest.json"
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
    return { pages: {}, entities: null, runtime: null, buildTime: null }
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
 * Computes a hash for the entities file.
 *
 * @param {string} rootDir - Source root directory.
 * @returns {Promise<string|null>} Hash of entities.js.
 */
export async function hashEntities(rootDir) {
  const entitiesPath = path.join(rootDir, "store", "entities.js")
  return await hashFile(entitiesPath)
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
 * Determines which pages need to be rebuilt.
 * Compares current file hashes against the manifest.
 *
 * @param {Array<Object>} pages - All pages to potentially build.
 * @param {Object} manifest - Previous build manifest.
 * @param {string} entitiesHash - Current entities hash.
 * @param {string} runtimeHash - Current SSX runtime hash.
 * @returns {Promise<{pagesToBuild: Array<Object>, pagesToSkip: Array<Object>}>} Object with pagesToBuild and pagesSkipped.
 */
export async function determineRebuildPages(
  pages,
  manifest,
  entitiesHash,
  runtimeHash,
) {
  // If entities changed, rebuild all pages
  if (manifest.entities !== entitiesHash) {
    console.log("📦 Entities changed, rebuilding all pages\n")
    return { pagesToBuild: pages, pagesToSkip: [] }
  }

  if (manifest.runtime !== runtimeHash) {
    console.log("🔁 SSX runtime changed, rebuilding all pages\n")
    return { pagesToBuild: pages, pagesToSkip: [] }
  }

  const pagesToBuild = []
  const pagesToSkip = []

  for (const page of pages) {
    const currentHash = await hashFile(page.filePath)
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
 * @param {string} entitiesHash - Hash of entities file.
 * @param {string} runtimeHash - Hash of SSX runtime internals.
 * @returns {Promise<Object>} New manifest.
 */
export async function createManifest(renderedPages, entitiesHash, runtimeHash) {
  const pages = {}

  for (const page of renderedPages) {
    const hash = await hashFile(page.filePath)
    pages[page.path] = {
      hash,
      filePath: page.filePath,
    }
  }

  return {
    pages,
    entities: entitiesHash,
    runtime: runtimeHash,
    buildTime: new Date().toISOString(),
  }
}
