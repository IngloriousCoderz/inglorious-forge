/**
 * Generates the client-side entry point script.
 * This script hydrates the store with the initial state (entities) and sets up the router.
 *
 * @param {Object} store - The server-side store instance containing the initial state.
 * @param {Array<Object>} pages - List of page objects to generate routes for.
 * @returns {string} The generated JavaScript code for the client entry point.
 */
export function generateApp(store, pages) {
  // Collect all unique page modules and their exports
  const routes = pages
    .filter((page, index) => {
      return pages.findIndex((p) => p.pattern === page.pattern) === index
    })
    .map(
      (page) =>
        `  "${page.pattern}": () => import("@/pages/${page.modulePath}")`,
    )

  return `import { createDevtools, createStore, mount } from "@inglorious/web"
import { getRoute, router, setRoutes } from "@inglorious/web/router"

const pages = ${JSON.stringify(
    pages.map(({ pattern, path, moduleName }) => ({
      pattern,
      path,
      moduleName,
    })),
    null,
    2,
  )}
const path = window.location.pathname + window.location.search + window.location.hash
const page = pages.find((page) => page.path === path)

const types = { router }

const entities = {
  router: {
    type: "router",
    path: page.path,
    route: page.moduleName,
  },
${JSON.stringify(store.getState(), null, 2).slice(1, -1)}
}

const middlewares = []
if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}

setRoutes({
${routes.join(",\n")}
})

const module = await getRoute(page.pattern)()
const type = module[page.moduleName]
types[page.moduleName] = type

const store = createStore({ types, entities, middlewares, autoCreateEntities: true })

const root = document.getElementById("root")

mount(store, (api) => {
  const { route } = api.getEntity("router")
  return api.render(route)
}, root)
`
}
