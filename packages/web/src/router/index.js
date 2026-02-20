/**
 * @typedef {import("../../types/router").RouterType} RouterType
 * @typedef {import("../../types/router").RouterEntity} RouterEntity
 * @typedef {import("../../types/router").Api} Api
 */

const SKIP_FULL_MATCH_GROUP = 1 // .match() result at index 0 is the full string
const REMOVE_COLON_PREFIX = 1

/**
 * Route configuration map. Keys are route patterns (e.g. `/users/:id`) and
 * values are either a string type name or a loader function that returns a
 * module exporting a type.
 * @type {Record<string, string|function>}
 */
const routeConfig = {}

/**
 * Guard to ensure global listeners are only attached once.
 * @type {boolean}
 */
let areListenersInitialized = false

/**
 * Client-side router for entity-based systems. Handles URL changes, link interception, and browser history management.
 * @type {RouterType}
 */
export const router = {
  /**
   * Initializes the router entity.
   * Sets up the initial route and event listeners for navigation.
   * @param {RouterEntity} entity - The router entity.
   * @param {void} payload - Unused payload.
   * @param {Api} api - The application API.
   */
  init(entity, payload, api) {
    // Handle initial route
    const { pathname, search } = window.location
    const initialPath = pathname + search
    const route = findRoute(routeConfig, initialPath)
    const entityId = entity.id

    if (route) {
      api.notify(`#${entityId}:navigate`, {
        to: initialPath,
        params: route.params,
        replace: true,
      })
    }

    if (areListenersInitialized) return
    areListenersInitialized = true

    // Listen for browser back/forward
    window.addEventListener("popstate", () =>
      api.notify(`#${entityId}:popstate`, payload),
    )

    // Intercept link clicks
    document.addEventListener("click", (event) => {
      // Find the closest <a> tag (handles clicks on children)
      const link = event.target.closest("a")

      if (!link) return

      // Skip external links
      if (link.target === "_blank") return
      if (link.rel === "external") return
      if (link.hasAttribute("data-external")) return

      // Skip different origin links
      if (link.origin !== window.location.origin) return

      // Skip links with download attribute
      if (link.hasAttribute("download")) return

      // Skip mailto:, tel:, etc.
      if (!["http:", "https:"].includes(link.protocol)) return

      // Prevent default and use router
      event.preventDefault()

      const path = link.pathname + link.search + link.hash
      api.notify(`#${entityId}:navigate`, path)
    })
  },

  /**
   * Handles browser `popstate` events.
   * Attempts to match the current location to a route and updates the router
   * entity state. If the matched route is lazy (a loader function) it will
   * attempt to load the module first.
   * @param {RouterEntity} entity
   * @param {Object} payload
   * @param {Api} api
   */
  async popstate(entity, payload, api) {
    const path = window.location.pathname + window.location.search
    const route = findRoute(routeConfig, path)
    const entityId = entity.id

    if (route) {
      if (typeof route.entityType === "function") {
        entity.isLoading = true
        entity.error = null

        try {
          const module = await route.entityType()
          api.notify(`#${entityId}:routeLoadSuccess`, { module, route })
          api.notify(`#${entityId}:popstate`, payload)
        } catch (error) {
          api.notify(`#${entityId}:routeLoadError`, { error, path })
        }

        return
      }

      updateRouter(entity, route)

      api.notify("routeChange", {
        route: entity.route,
        params: entity.params,
        query: entity.query,
        path: entity.path,
      })
    }
  },

  /**
   * Handles navigation to a new route.
   * @param {RouterEntity} entity - The router entity.
   * @param {string|number|{to: string, params?: object, replace?: boolean, state?: object}} payload - The navigation target or options.
   * @param {Api} api - The application API.
   */
  async navigate(entity, payload, api) {
    const options = ["number", "string"].includes(typeof payload)
      ? { to: payload }
      : payload
    const { to, params, replace, force, state = {} } = options

    // Numeric navigation (back/forward)
    if (typeof to === "number") {
      history.go(to)
      return
    }

    // Build final path
    let path = to

    // If params provided and "to" looks like a pattern, build the path
    if (params && to.includes(":")) {
      path = buildPath(to, params)
    }

    // If "to" is already a final path (like "/users/1"), use it directly
    // The router will match it against patterns in routeConfig

    const route = findRoute(routeConfig, path)
    const entityId = entity.id

    if (!route) {
      console.warn(`No route matches path: ${path}`)
      return
    }

    if (!force) {
      // Prevent navigation if the full path (including query/hash) is identical.
      const currentFullPath =
        entity.path + window.location.search + window.location.hash
      if (path === currentFullPath) {
        return
      }
    }

    // Asynchronous navigation
    if (typeof route.entityType === "function") {
      entity.isLoading = true
      entity.error = null

      try {
        const module = await route.entityType()
        api.notify(`#${entityId}:routeLoadSuccess`, { module, route })
        api.notify(`#${entityId}:navigate`, payload)
      } catch (error) {
        api.notify(`#${entityId}:routeLoadError`, { error, path })
      }

      return
    }

    updateRouter(entity, route)

    // Prepare history state
    const historyState = {
      ...state,
      route: entity.route,
      params: entity.params,
      query: entity.query,
      path: entity.path,
    }

    // Navigate
    const method = replace ? "replaceState" : "pushState"
    history[method](historyState, "", path)

    api.notify("routeChange", historyState)
  },

  /**
   * Handles successful loading of a lazily-loaded route module.
   * Registers the loaded type in the runtime type registry via `api.setType`
   * and updates the `routeConfig` entry for the pattern.
   * @param {RouterEntity} entity
   * @param {{module: object, route: {pattern: string, entityType: string}}} payload
   * @param {Api} api
   */
  routeLoadSuccess(entity, payload, api) {
    const { module, route } = payload

    const [typeName, type] = Object.entries(module).find(
      ([, type]) => type?.render,
    )

    api.setType(typeName, type)
    routeConfig[route.pattern] = typeName

    entity.isLoading = false
  },

  /**
   * Handles errors during lazy route loading.
   * @param {RouterEntity} entity - The router entity.
   * @param {{error: Error, path: string}} payload - The error payload.
   */
  routeLoadError(entity, payload) {
    const { error, path } = payload
    console.error(`Failed to load route ${path}:`, error)
    entity.path = path
    entity.isLoading = false
    entity.error = error
  },
}

/**
 * Retrieves the current route configuration.
 * @returns {Record<string, string|function>} The current route configuration.
 */
export function getRoutes() {
  return routeConfig
}

/**
 * Retrieves a single route configuration given its path.
 * @param {string} path - The path of the route to retrieve.
 * @returns {string|function|undefined} The route configuration or undefined if not found.
 */
export function getRoute(path) {
  return routeConfig[path]
}

/**
 * Sets or updates routes in the route configuration.
 * Can be used both during initialization and at any point to add or update routes dynamically.
 * @param {Record<string, string|function>} routes - An object mapping route paths/patterns to entity type names or loader functions.
 */
export function setRoutes(routes) {
  Object.assign(routeConfig, routes)
}

/**
 * Adds a single route to the route configuration.
 * @param {string} path - The route path or pattern (e.g., "/users/:userId").
 * @param {string|function} route - The entity type name or a function that dynamically loads it.
 */
export function addRoute(path, route) {
  routeConfig[path] = route
}

/**
 * Removes a route from the route configuration.
 * @param {string} path - The route path or pattern to remove.
 */
export function removeRoute(path) {
  delete routeConfig[path]
}

/**
 * Builds a URL path by substituting parameters into a route pattern.
 * @param {string} pattern - The route pattern (e.g., "/users/:userId").
 * @param {Record<string, string>} [params={}] - The parameters to substitute.
 * @returns {string} The constructed path.
 * @example
 * buildPath("/users/:userId", { userId: "123" }) // returns "/users/123"
 */
function buildPath(pattern, params = {}) {
  let path = pattern
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value)
  })
  return path
}

/**
 * Finds a matching route configuration for a given URL path.
 * It supports parameterized routes and a fallback "*" route.
 * @param {Record<string, string>} routeConfig - The routes configuration map.
 * @param {string} pathname - The URL path to match.
 * @returns {{pattern: string, entityType: string, params: Record<string, string>, path: string}|null}
 * The matched route object or null if no match is found.
 */
function findRoute(routeConfig, pathname) {
  const [path, search] = pathname.split("?")
  let fallbackRoute = null

  for (const [pattern, entityType] of Object.entries(routeConfig)) {
    if (pattern === "*") {
      fallbackRoute = { pattern, entityType, params: {}, path }
      continue
    }

    const params = matchRoute(pattern, path)
    if (params !== null) {
      const query = search
        ? Object.fromEntries(new URLSearchParams(search))
        : {}
      return { pattern, entityType, params, path, query }
    }
  }

  return fallbackRoute
}

/**
 * Matches a URL path against a route pattern and extracts any parameters.
 * @param {string} pattern - The route pattern (e.g., "/users/:userId").
 * @param {string} path - The URL path to match (e.g., "/users/123").
 * @returns {Record<string, string>|null} An object of extracted parameters,
 * or null if the path does not match the pattern.
 */
function matchRoute(pattern, path) {
  const paramNames = getParamNames(pattern)
  const regex = patternToRegex(pattern)
  const match = path.match(regex)

  if (!match) return null

  const params = {}
  paramNames.forEach((name, i) => {
    params[name] = match[i + SKIP_FULL_MATCH_GROUP]
  })

  return params
}

/**
 * Parses a route pattern and extracts the names of its parameters.
 * @param {string} pattern - The route pattern.
 * @returns {string[]} An array of parameter names.
 * @example
 * getParamNames("/users/:userId/posts/:postId") // returns ["userId", "postId"]
 */
function getParamNames(pattern) {
  const matches = pattern.match(/:(\w+)/g)
  return matches ? matches.map((m) => m.slice(REMOVE_COLON_PREFIX)) : []
}

/**
 * Converts a route pattern into a regular expression for matching URL paths.
 * @param {string} pattern - The route pattern (e.g., "/users/:userId").
 * @returns {RegExp} The corresponding regular expression.
 */
function patternToRegex(pattern) {
  const regexPattern = pattern
    .replace(/\//g, "\\/")
    .replace(/:(\w+)/g, "([^\\/]+)")
  return new RegExp(`^${regexPattern}$`)
}

/**
 * Updates the router entity's internal state.
 * @param {RouterEntity} entity - The router entity.
 * @param {object} options - The update options.
 * @param {string} options.entityType - The matched entity type.
 * @param {string} options.path - The full path (pathname only, no query).
 * @param {object} options.params - The extracted route parameters.
 * @param {object} [options.query] - The parsed query parameters.
 */
function updateRouter(entity, { entityType, path, params, query }) {
  entity.route = entityType
  entity.path = path
  entity.params = params
  entity.query = query
  entity.hash = window.location.hash
}
