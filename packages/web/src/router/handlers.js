/**
 * @typedef {import("../../types/router").RouterType} RouterType
 * @typedef {import("../../types/router").RouterEntity} RouterEntity
 * @typedef {import("../../types/router").Api} Api
 */

import { toCamelCase } from "@inglorious/utils/data-structures/string.js"

const SKIP_FULL_MATCH_GROUP = 1
const REMOVE_COLON_PREFIX = 1
const FIRST_HISTORY_INDEX = 0
const PUSH_HISTORY_STEP = 1

export function createHandlers(routeConfig) {
  /**
   * Guard to ensure global listeners are only attached once.
   * @type {boolean}
   */
  let areListenersInitialized = false

  return {
    /**
     * Initializes the router entity.
     * Sets up the initial route and event listeners for navigation.
     * @param {RouterEntity} entity - The router entity.
     * @param {void} payload - Unused payload.
     * @param {Api} api - The application API.
     */
    init(entity, payload, api) {
      if (window.history.state?.idx == null) {
        window.history.replaceState(
          { ...window.history.state, idx: FIRST_HISTORY_INDEX },
          "",
        )
      }
      entity.idx = window.history.state?.idx ?? FIRST_HISTORY_INDEX

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

      window.addEventListener("popstate", () =>
        api.notify(`#${entityId}:popstate`, payload),
      )

      document.addEventListener("click", (event) => {
        const link = event.target.closest("a")

        if (!link) return

        if (link.target === "_blank") return
        if (link.rel === "external") return
        if (link.hasAttribute("data-external")) return

        if (link.origin !== window.location.origin) return

        if (link.hasAttribute("download")) return

        if (!["http:", "https:"].includes(link.protocol)) return

        event.preventDefault()

        const path = link.pathname + link.search + link.hash

        if (link.hasAttribute("data-is-focus-kept")) {
          api.notify(`#${entityId}:navigate`, {
            to: path,
            state: { isFocusKept: true },
          })
          return
        }

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
        if (typeof route.route === "function") {
          entity.isLoading = true
          entity.error = null

          try {
            const module = await route.route()
            api.notify(`#${entityId}:routeLoadSuccess`, { module, route })
            api.notify(`#${entityId}:popstate`, payload)
          } catch (error) {
            api.notify(`#${entityId}:routeLoadError`, { error, path })
          }

          return
        }

        updateRouter(entity, route)
        entity.idx = window.history.state?.idx ?? FIRST_HISTORY_INDEX

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

      if (typeof to === "number") {
        history.go(to)
        return
      }

      let path = to

      if (params && to.includes(":")) {
        path = buildPath(to, params)
      }

      const route = findRoute(routeConfig, path)
      const entityId = entity.id

      if (!route) {
        console.warn(`No route matches path: ${path}`)
        return
      }

      if (!force) {
        const currentFullPath =
          entity.path + window.location.search + window.location.hash
        if (path === currentFullPath) {
          return
        }
      }

      if (typeof route.route === "function") {
        entity.isLoading = true
        entity.error = null

        try {
          const module = await route.route()
          api.notify(`#${entityId}:routeLoadSuccess`, { module, route })
          api.notify(`#${entityId}:navigate`, payload)
        } catch (error) {
          api.notify(`#${entityId}:routeLoadError`, { error, path })
        }

        return
      }

      updateRouter(entity, route)

      const historyState = {
        ...state,
        /* Written before the notification that triggers the render, so that
           anything reading the history entry during that render sees the new
           index. `withTransitions` depends on this ordering. */
        idx: replace ? entity.idx : entity.idx + PUSH_HISTORY_STEP,
        route: entity.route,
        params: entity.params,
        query: entity.query,
        path: entity.path,
      }

      const method = replace ? "replaceState" : "pushState"
      history[method](historyState, "", path)
      entity.idx = historyState.idx

      api.notify("routeChange", historyState)
    },

    /**
     * Goes back one entry when the app has an entry of its own to go back to,
     * and otherwise navigates to the fallback in place. An app opened on a deep
     * link starts at the first index, where `history.back()` would leave the
     * app or do nothing at all.
     * @param {RouterEntity} entity - The router entity.
     * @param {string|{to: string, params?: object, state?: object}} [fallback] - Where to go when there is nothing to go back to.
     * @param {Api} api - The application API.
     */
    back(entity, fallback, api) {
      if (entity.idx > FIRST_HISTORY_INDEX) {
        history.back()
        return
      }

      if (fallback == null) return

      const options = typeof fallback === "string" ? { to: fallback } : fallback
      api.notify(`#${entity.id}:navigate`, { ...options, replace: true })
    },

    /**
     * Handles successful loading of a lazily-loaded route module.
     * Registers the loaded type in the runtime type registry via `api.setType`
     * and updates the `routeConfig` entry for the pattern.
     * @param {RouterEntity} entity
     * @param {{module: object, route: {pattern: string, route: string}}} payload
     * @param {Api} api
     */
    routeLoadSuccess(entity, payload, api) {
      const { module, route } = payload

      const [typeName, type] = Object.entries(module).find(
        ([, type]) => type?.render,
      )

      api.setType(typeName, type)
      const [routeEntity] = api.getEntities(typeName)
      routeConfig[route.pattern] = routeEntity?.id ?? toCamelCase(typeName)

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

  for (const [pattern, route] of Object.entries(routeConfig)) {
    if (pattern === "*") {
      fallbackRoute = { pattern, route, params: {}, path }
      continue
    }

    const params = matchRoute(pattern, path)
    if (params !== null) {
      const query = search
        ? Object.fromEntries(new URLSearchParams(search))
        : {}
      return { pattern, route, params, path, query }
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
 * @param {string} options.route - The matched entity.
 * @param {string} options.path - The full path (pathname only, no query).
 * @param {object} options.params - The extracted route parameters.
 * @param {object} [options.query] - The parsed query parameters.
 */
function updateRouter(entity, { route, path, params, query }) {
  entity.route = route
  entity.path = path
  entity.params = params
  entity.query = query
  entity.hash = window.location.hash
}
