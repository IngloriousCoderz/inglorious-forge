import path from "node:path"
import { pathToFileURL } from "node:url"

import { renderPage } from "../render/index.js"
import { extractPageMetadata } from "./metadata.js"

/**
 * Generates HTML and metadata for a list of pages.
 * It loads the page module, executes the `load` function (if defined),
 * renders the HTML, and extracts metadata.
 *
 * @param {Object} store - The application store.
 * @param {Array<Object>} pages - List of pages to generate.
 * @param {Object} [options] - Generation options.
 * @param {boolean} [options.shouldGenerateHtml=true] - Whether to generate HTML.
 * @param {boolean} [options.shouldGenerateMetadata=true] - Whether to generate metadata.
 * @param {Function} [loader] - Optional loader function.
 * @returns {Promise<Array<Object>>} The processed pages with `html` and `metadata` properties added.
 */
export async function generatePages(store, pages, options = {}, loader) {
  const { shouldGenerateHtml = true, shouldGenerateMetadata = true } = options
  const load = loader || ((p) => import(pathToFileURL(path.resolve(p))))

  const api = store._api

  for (const page of pages) {
    console.log(
      `  Generating ${shouldGenerateHtml ? "HTML" : ""}${shouldGenerateHtml && shouldGenerateMetadata ? " and " : ""}${shouldGenerateMetadata ? "metadata" : ""} for ${page.path}...`,
    )

    const module = await load(page.filePath)
    page.module = module

    const entity = api.getEntity(page.moduleName)
    if (page.locale) {
      entity.locale = page.locale
    }

    if (module.load) {
      await module.load(entity, page)
    }

    if (shouldGenerateHtml) {
      const html = await renderPage(store, page, entity, {
        ...options,
        wrap: true,
      })
      page.html = html
    }

    if (shouldGenerateMetadata) {
      const metadata = extractPageMetadata(store, page, entity, options)
      page.metadata = metadata
    }
  }

  return pages
}
