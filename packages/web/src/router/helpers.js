export function createHelpers(routeConfig) {
  return {
    /**
     * Retrieves the current route configuration.
     * @returns {Record<string, string|function>} The current route configuration.
     */
    getRoutes() {
      return routeConfig
    },

    /**
     * Retrieves a single route configuration given its path.
     * @param {string} path - The path of the route to retrieve.
     * @returns {string|function|undefined} The route configuration or undefined if not found.
     */
    getRoute(path) {
      return routeConfig[path]
    },

    /**
     * Sets or updates routes in the route configuration.
     * Can be used both during initialization and at any point to add or update routes dynamically.
     * @param {Record<string, string|function>} routes - An object mapping route paths/patterns to entity type names or loader functions.
     */
    setRoutes(routes) {
      Object.assign(routeConfig, routes)
    },

    /**
     * Adds a single route to the route configuration.
     * @param {string} path - The route path or pattern (e.g., "/users/:userId").
     * @param {string|function} route - The entity type name or a function that dynamically loads it.
     */
    addRoute(path, route) {
      routeConfig[path] = route
    },

    /**
     * Removes a route from the route configuration.
     * @param {string} path - The route path or pattern to remove.
     */
    removeRoute(path) {
      delete routeConfig[path]
    },
  }
}
