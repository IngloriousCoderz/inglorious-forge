import { existsSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import { createStore } from "@inglorious/web"

import { getModuleName } from "../utils/module.js"

/**
 * Generates the application store based on the provided pages and configuration.
 * It loads page modules to register their exported entities as store types.
 * It also attempts to load initial entities from an `entities.js` file in the root directory.
 *
 * @param {Array<Object>} pages - List of page objects containing file paths.
 * @param {Object} options - Configuration options.
 * @param {string} [options.rootDir="src"] - Root directory to look for entities.js.
 * @param {Function} [loader] - Optional loader function.
 * @returns {Promise<Object>} The initialized store instance.
 */
export async function generateStore(pages = [], options = {}, loader) {
  const { rootDir = "." } = options
  const srcDir = path.join(rootDir, "src")

  const load = loader || ((p) => import(pathToFileURL(p)))

  const types = {}
  for (const page of pages) {
    const pageModule = await load(page.filePath)
    const name = getModuleName(pageModule)
    types[name] = pageModule[name]
  }

  let entities = {}
  const extensions = ["js", "ts"]

  for (const ext of extensions) {
    const fullPath = path.join(srcDir, "store", `entities.${ext}`)

    if (existsSync(fullPath)) {
      try {
        const module = await load(fullPath)
        entities = module.entities
        break
      } catch {
        // ignore and try next extension
      }
    }
  }

  const store = createStore({ types, entities, autoCreateEntities: true })
  store.update() // let the create() handlers run
  return store
}
