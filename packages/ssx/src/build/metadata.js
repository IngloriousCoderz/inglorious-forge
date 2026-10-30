import { createGetPageOption } from "../utils/page-options.js"

const DEFAULT_OPTIONS = {
  title: "",
  meta: {},
  pubDate: "",
  author: "",
  category: "",
  changefreq: "weekly",
  priority: 0.5,
  updatedAt: "",
}

export function extractPageMetadata(store, page, entity, options = {}) {
  const { path, module } = page
  const { hostname = "" } = options.sitemap ?? {}

  const getPageOption = createGetPageOption(store, module, entity)

  const updatedAt = getPageOption("updatedAt", DEFAULT_OPTIONS)
  const changefreq = getPageOption("changefreq", DEFAULT_OPTIONS)
  const priority = getPageOption("priority", DEFAULT_OPTIONS)

  const loc = `${hostname}${path}`

  let lastmod
  try {
    lastmod = updatedAt
      ? new Date(updatedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  } catch {
    console.warn(`⚠️  Invalid updatedAt date for page ${path}: ${updatedAt}`)
    lastmod = new Date().toISOString().split("T")[0]
  }

  const title = getPageOption("title", DEFAULT_OPTIONS)
  const meta = getPageOption("meta", DEFAULT_OPTIONS)
  const description = meta.description
  const pubDate = getPageOption("pubDate", DEFAULT_OPTIONS)
  const author = getPageOption("author", DEFAULT_OPTIONS)
  const category = getPageOption("category", DEFAULT_OPTIONS)

  return {
    updatedAt,
    changefreq,
    priority,
    loc,
    lastmod,
    title,
    path: page.path,
    description,
    meta,
    pubDate,
    author,
    category,
  }
}
