import { getTextDirection } from "./i18n.js"
import { createGetPageOption } from "./page-options.js"

const DEFAULT_OPTIONS = { title: "", lang: "", dir: "", meta: {} }

/**
 * Keeps the document in step with the current page during client-side navigation.
 * The server renders the head of the page the visitor lands on; after that, the title,
 * the meta tags and the `lang` and `dir` of `<html>` follow the page's `metadata`, merged
 * over the site defaults the same way the server merges them, with the page's locale ahead
 * of the site language and the direction following the language.
 *
 * The metadata is read again whenever the store changes, so values computed from entity
 * data pick up data fetched after the route change.
 *
 * The title it returns a reader for is what `mount` announces after a navigation, so a
 * title that waits for data is announced once that data arrives.
 *
 * @param {Object} store - The application store.
 * @param {Object<string, Object>} modules - Loaded page modules, keyed by page type name.
 * @param {Object} [site] - Site-wide defaults from the site config.
 * @param {string} [site.title=""] - The title used when a page sets none.
 * @param {string} [site.lang="en"] - The language used when a page sets none.
 * @param {Object<string, string>} [site.meta={}] - Meta tags shared by every page.
 * @returns {function(): (string | null)} The current page title, or `null` while it is not
 *   known yet: `mount`'s `getPageName`.
 */
export function syncPageHead(store, modules, site = {}) {
  const {
    title: siteTitle = "",
    lang: siteLang = "en",
    meta: siteMeta = {},
  } = site

  const getHead = () => {
    const head = readPageHead(store, modules)
    if (!head) return null

    const lang = head.lang || siteLang
    return {
      title: head.title || siteTitle,
      lang,
      dir: head.dir || getTextDirection(lang),
      meta: { ...siteMeta, ...head.meta },
    }
  }

  let head = getHead()

  store.subscribe(() => {
    const nextHead = getHead()
    if (!nextHead) return

    applyHead(nextHead, head)
    head = nextHead
  })

  return () => getHead()?.title ?? null
}

function readPageHead(store, modules) {
  const { route } = store._api.getEntity("router")
  const entity = store._api.getEntity(route)
  const module = entity && modules[entity.type]
  if (!module) return null

  try {
    const getPageOption = createGetPageOption(store, module, entity)
    return {
      title: getPageOption("title", DEFAULT_OPTIONS),
      lang: getPageOption("lang", DEFAULT_OPTIONS) || entity.locale,
      dir: getPageOption("dir", DEFAULT_OPTIONS),
      meta: getPageOption("meta", DEFAULT_OPTIONS),
    }
  } catch {
    // Metadata computed from entity data throws until that data arrives.
    return null
  }
}

function applyHead(head, previous) {
  if (document.title !== head.title) {
    document.title = head.title
  }

  const root = document.documentElement
  if (root.lang !== head.lang) {
    root.lang = head.lang
  }
  if (root.dir !== head.dir) {
    root.dir = head.dir
  }

  // Only tags named by this page or the previous one are touched, so those the
  // layout writes on its own stay as they are.
  const names = new Set([
    ...Object.keys(previous?.meta ?? {}),
    ...Object.keys(head.meta),
  ])
  for (const name of names) {
    applyMeta(name, head.meta[name])
  }
}

function applyMeta(name, content) {
  // The server writes Open Graph style names, such as og:image, as `property`.
  const attribute = name.includes(":") ? "property" : "name"
  let tag = [...document.head.querySelectorAll("meta")].find(
    (meta) => meta.getAttribute(attribute) === name,
  )

  if (content == null) {
    tag?.remove()
    return
  }

  if (!tag) {
    tag = document.createElement("meta")
    tag.setAttribute(attribute, name)
    document.head.append(tag)
  }

  const value = String(content)
  if (tag.getAttribute("content") !== value) {
    tag.setAttribute("content", value)
  }
}
