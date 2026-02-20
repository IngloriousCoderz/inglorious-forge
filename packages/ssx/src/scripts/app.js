/**
 * Generates the client-side entry point script.
 * This script hydrates the store with the initial state (entities) and sets up the router.
 *
 * @param {Object} store - The server-side store instance containing the initial state.
 * @param {Array<Object>} pages - List of page objects to generate routes for.
 * @param {Object} [options] - Runtime options.
 * @returns {string} The generated JavaScript code for the client entry point.
 */
export function generateApp(store, pages, options = {}) {
  const i18n = options.i18n || inferI18nFromPages(pages)
  const isDev = Boolean(options.isDev)

  // Build client route map, including localized patterns (e.g. /it/about).
  const routesByPattern = new Map()
  for (const page of pages) {
    const routePattern = getClientRoutePattern(page)
    if (routesByPattern.has(routePattern)) continue
    routesByPattern.set(
      routePattern,
      `  "${routePattern}": () => import("@/pages/${page.modulePath}")`,
    )
  }
  const routes = [...routesByPattern.values()]

  return `import { createDevtools, createStore, mount } from "@inglorious/web"
import { getRoute, router, setRoutes } from "@inglorious/web/router"
import { getLocaleFromPath } from "@inglorious/ssx/i18n"

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
const path = normalizeRoutePath(window.location.pathname)
const page = pages.find((page) => normalizeRoutePath(page.path) === path)

const types = { router }

const i18n = ${JSON.stringify(i18n, null, 2)}
const isDev = ${JSON.stringify(isDev)}

const entities = {
  router: {
    type: "router",
    path,
    route: page?.moduleName,
  },
  i18n: {
    type: "i18n",
    ...i18n,
  },
${JSON.stringify(store.getState(), null, 2).slice(1, -1)}
}

const middlewares = []
if (isDev) {
  middlewares.push(createDevtools().middleware)
}

const systems = []
if (i18n.defaultLocale && i18n.locales?.length) {
  systems.push({
    routeChange(state, payload) {
      const routeType = payload?.route
      if (!routeType) return

      const entity = state[routeType]
      if (!entity) return

      entity.locale = getLocaleFromPath(payload.path, i18n)
    },
  })
}

setRoutes({
${routes.join(",\n")}
})

const module = await getRoute(page.pattern)()
const type = module[page.moduleName]
types[page.moduleName] = type

const store = createStore({ types, entities, middlewares, systems, autoCreateEntities: true })

const root = document.getElementById("root")

mount(store, (api) => {
  const { route } = api.getEntity("router")
  return api.render(route)
}, root)
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
