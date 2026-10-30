import { toCamelCase } from "@inglorious/utils/data-structures/string.js"

import { getTextDirection, selectLocale } from "../utils/i18n.js"
import { createGetPageOption } from "../utils/page-options.js"
import { toHTML } from "./html.js"

const DEFAULT_OPTIONS = {
  lang: "",
  dir: "",
  charset: "",
  title: "",
  favicon: "",
  meta: {},
  styles: [],
  head: "",
  scripts: [],
}

/**
 * Renders a specific page using the store and page options.
 * It resolves page-specific metadata (title, meta, etc.) before rendering.
 *
 * @param {Object} store - The application store.
 * @param {Object} page - The page object (from router).
 * @param {Object} entity - The entity associated with the page.
 * @param {Object} [options] - Global site options/defaults.
 * @returns {Promise<string>} The rendered HTML.
 */
export async function renderPage(store, page, entity, options = {}) {
  const { moduleName, module } = page
  const entityId = entity?.id ?? toCamelCase(moduleName)

  // Before anything translates, and with nothing awaited until the templates are built,
  // so that other renders sharing the translations cannot switch them in between.
  selectLocale(store, entity?.locale)

  const getPageOption = createGetPageOption(store, module, entity)

  const lang =
    getPageOption("lang", DEFAULT_OPTIONS) || entity?.locale || options.lang
  const dir = getPageOption("dir", DEFAULT_OPTIONS) || getTextDirection(lang)
  const charset = getPageOption("charset", DEFAULT_OPTIONS) || options.charset
  const title = getPageOption("title", DEFAULT_OPTIONS) || options.title
  const favicon = getPageOption("favicon", DEFAULT_OPTIONS) || options.favicon
  const meta = { ...options.meta, ...getPageOption("meta", DEFAULT_OPTIONS) }
  const styles = [
    ...(options.styles || []),
    ...getPageOption("styles", DEFAULT_OPTIONS),
  ]
  const head = getPageOption("head", DEFAULT_OPTIONS) || options.head
  const scripts = [
    ...(options.scripts || []),
    ...getPageOption("scripts", DEFAULT_OPTIONS),
  ]

  return toHTML(store, (api) => api.render(entityId), {
    ...options,
    lang,
    dir,
    charset,
    title,
    favicon,
    meta,
    styles,
    head,
    scripts,
    ssxPage: { [entityId]: entity },
  })
}
