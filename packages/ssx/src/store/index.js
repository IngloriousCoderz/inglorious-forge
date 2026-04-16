import { pathToFileURL } from "node:url"

import { createStore } from "@inglorious/store"

import { getModuleName } from "../utils/module.js"
import { getStoreStuff } from "./stuff.js"

/**
 * Generates the application store based on the provided pages and configuration.
 * It loads page modules to register their exported entities as store types.
 * It also attempts to load initial entities from an `entities.js` file and
 * additional types from a `types.js` file in the store directory.
 *
 * @param {Array<Object>} pages - List of page objects containing file paths.
 * @param {Object} options - Configuration options.
 * @param {string} [options.rootDir="src"] - Root directory to look for entities.js.
 * @param {Function} [loader] - Optional loader function.
 * @returns {Promise<Object>} The initialized store instance.
 */
export async function generateStore(pages = [], options = {}, loader) {
  const load = loader || ((p) => import(pathToFileURL(p)))

  const types = await getStoreStuff("types", options, loader)

  for (const page of pages) {
    const pageModule = await load(page.filePath)
    const name = getModuleName(pageModule)
    types[name] = pageModule[name]
  }

  const entities = await getStoreStuff("entities", options, loader)

  const store = createStore({ types, entities, autoCreateEntities: true })
  return store
}
