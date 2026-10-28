import { getStoreStuff } from "../store/stuff.js"

/**
 * Generates the client-side entry point script.
 * This script hydrates the store with the initial state (entities) and sets up the router.
 *
 * @param {Array<Object>} pages - List of page objects to generate routes for.
 * @param {Object} [options] - Runtime options.
 * @param {boolean} [options.hasTypesFile] - Whether src/store/types.js exists.
 * @param {boolean} [options.hasEntitiesFile] - Whether src/store/entities.js exists.
 * @param {string} [options.title] - The site title, used when a page sets none.
 * @param {string} [options.lang] - The site language, used when a page sets none.
 * @param {Object} [options.meta] - Meta tags shared by every page.
 * @returns {string} The generated JavaScript code for the client entry point.
 */
export async function generateApp(pages, options = {}, loader) {
  const i18n = options.i18n || inferI18nFromPages(pages)
  const isDev = Boolean(options.isDev)

  const types = await getStoreStuff("types", options, loader)
  const hasTypesFile = Object.keys(types).length
  const entities = await getStoreStuff("entities", options, loader)
  const hasEntitiesFile = Object.keys(entities).length

  // Build client route map, including localized patterns (e.g. /it/about).
  const routesByPattern = new Map()
  for (const page of pages) {
    const routePattern = getClientRoutePattern(page)
    if (routesByPattern.has(routePattern)) continue
    routesByPattern.set(
      routePattern,
      `  "${routePattern}": loadPage(${JSON.stringify(page.moduleName)}, () => import("@/pages/${page.modulePath}"))`,
    )
  }
  const routes = [...routesByPattern.values()]

  const typesImport = hasTypesFile
    ? `import { types as additionalTypes } from "@/store/types.js"`
    : ""

  const entitiesImport = hasEntitiesFile
    ? `import { entities as additionalEntities } from "@/store/entities.js"`
    : ""

  const typesAssignment = hasTypesFile
    ? `Object.assign(types, additionalTypes)`
    : ""

  const entitiesAssignment = hasEntitiesFile
    ? `Object.assign(entities, additionalEntities)`
    : ""

  return `import "@inglorious/web/hydrate"
import { createStore } from "@inglorious/store"
import { createDevtools } from "@inglorious/store/client/devtools"
import { mount } from "@inglorious/web"
import { Router, getRoute, setRoutes } from "@inglorious/web/router"
import { getLocaleFromPath, syncPageHead, waitForLocale } from "@inglorious/ssx/client"

${typesImport}
${entitiesImport}

const normalizePathname = (path = "/") => path.split("?")[0].split("#")[0]
const normalizeRoutePath = (path = "/") => {
  const pathname = normalizePathname(path)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }
  return pathname
}

const pages = ${JSON.stringify(
    pages.map(({ pattern, path, moduleName, locale }) => ({
      pattern,
      path,
      moduleName,
      locale,
    })),
    null,
    2,
  )}
// A server-rendered dynamic page is listed by its pattern, such as /posts/:id.
const matchesPattern = (pattern, path) => {
  const patternParts = pattern.split("/").filter(Boolean)
  const pathParts = path.split("/").filter(Boolean)
  if (patternParts.includes("*")) {
    const fixed = patternParts.slice(0, patternParts.indexOf("*"))
    return fixed.every((part, i) => part.startsWith(":") || part === pathParts[i])
  }
  return (
    patternParts.length === pathParts.length &&
    patternParts.every((part, i) => part.startsWith(":") || part === pathParts[i])
  )
}

const path = normalizeRoutePath(window.location.pathname)
const page =
  pages.find((page) => normalizeRoutePath(page.path) === path) ??
  pages.find((page) => matchesPattern(page.path, path))

const types = { Router }
${typesAssignment}

const i18n = ${JSON.stringify(i18n, null, 2)}
const isDev = ${JSON.stringify(isDev)}

const toCamelCase = (str) => {
  const [firstChar, ...rest] = str
  return [firstChar.toLowerCase(), ...rest].join("")
}

const entities = {
  router: { type: "Router", path, route: toCamelCase(page?.moduleName) },
}
${entitiesAssignment}
Object.assign(entities, JSON.parse(document.getElementById("__SSX_PAGE__").textContent))


const middlewares = []
if (isDev) {
  middlewares.push(createDevtools().middleware)
}

const systems = []
if (i18n.defaultLocale && i18n.locales?.length) {
  systems.push({
    routeChange(state, payload, api) {
      if (!payload?.path) return
      const locale = getLocaleFromPath(payload.path, i18n)

      const entity = state[payload.route]
      if (entity) entity.locale = locale

      // The URL decides the locale, as it did for the page the server rendered, so
      // an @inglorious/i18n entity follows it rather than the browser's language.
      const translator = state.i18n
      if (translator?.locale !== locale && api.getType(translator?.type)?.localeChange) {
        api.notify("#i18n:localeChange", locale)
      }
    },
  })
}

// Page modules by type name, kept so client navigation can read their metadata.
const modules = {}
const loadPage = (moduleName, load) => async () => {
  const module = await load()
  modules[moduleName] = module
  return module
}

setRoutes({
${routes.join(",\n")}
})

const module = await getRoute(page.pattern)()
const type = module[page.moduleName]
types[page.moduleName] = type

const store = createStore({ types, entities, middlewares, systems, autoCreateEntities: true })

const root = document.getElementById("root")

if (i18n.defaultLocale && i18n.locales?.length) {
  // Hydrates in the language the server rendered, with its translations loaded.
  await waitForLocale(store, getLocaleFromPath(path, i18n))
}

const getPageName = syncPageHead(store, modules, ${JSON.stringify({ title: options.title, lang: options.lang, meta: options.meta })})

mount(store, (api) => {
  const { route } = api.getEntity("router")
  return api.render(route)
}, root, { getPageName })
`
}

function inferI18nFromPages(pages = []) {
  const locales = [...new Set(pages.map((page) => page.locale).filter(Boolean))]
  if (!locales.length) return {}

  const defaultLocale =
    locales.find((locale) =>
      pages.some((page) => {
        if (page.locale !== locale) return false
        const localePrefix = `/${locale}`
        return (
          page.path === "/" ||
          !(
            page.path === localePrefix ||
            page.path.startsWith(`${localePrefix}/`)
          )
        )
      }),
    ) || locales[0]

  return { defaultLocale, locales }
}

function getClientRoutePattern(page) {
  const { pattern = "/", path = "", locale } = page
  if (!locale) return pattern

  const localePrefix = `/${locale}`
  const isLocalePrefixedPath =
    path === localePrefix || path.startsWith(`${localePrefix}/`)

  if (!isLocalePrefixedPath) return pattern
  if (pattern === "/") return localePrefix

  return `${localePrefix}${pattern}`
}
