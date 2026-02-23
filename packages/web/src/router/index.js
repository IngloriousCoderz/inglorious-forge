import { createHandlers } from "./handlers.js"
import { createHelpers } from "./helpers.js"

/**
 * Route configuration map. Keys are route patterns (e.g. `/users/:id`) and
 * values are either a string type name or a loader function that returns a
 * module exporting a type.
 * @type {Record<string, string|function>}
 */
const routeConfig = {}

export const router = { ...createHandlers(routeConfig) }

export const { getRoutes, getRoute, setRoutes, addRoute, removeRoute } =
  createHelpers(routeConfig)
