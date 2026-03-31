import type { Api } from "./mount"

/**
 * A map of route patterns to entity types.
 * The order of routes matters: more specific routes (e.g., `/users/new`)
 * should be defined before more generic ones (e.g., `/users/:id`).
 *
 * A special `'*'` pattern can be used as a fallback for "not found" routes.
 * @example { "/users/:id": "userPage", "/": "homePage" }
 */
export type RoutesConfig = Record<string, string>

/**
 * An object containing parameters extracted from the route.
 * @example { id: "123" } for route "/users/:id" and path "/users/123"
 */
export type RouteParams = Record<string, string>

/**
 * An object containing query string parameters.
 * @example { sort: "asc" } for path "/users?sort=asc"
 */
export type QueryParams = Record<string, string>

/**
 * Represents the state of the router entity.
 */
export interface RouterEntity {
  /** A unique identifier for the router entity. */
  id: string | number
  /** The current active path, without query string or hash. */
  path?: string
  /** The entity type of the current active route. */
  route?: string
  /** The parameters extracted from the current path. */
  params?: RouteParams
  /** The query parameters from the current URL. */
  query?: QueryParams
  /** The hash from the current URL. */
  hash?: string
  /** Whether a route is currently loading asynchronously. */
  isLoading?: boolean
  /** An error that occurred during route loading. */
  error?: Error | null
}

/**
 * The payload for the `navigate` function.
 */
export interface NavigatePayload {
  /** The path to navigate to, or a number to move in the history stack (e.g., -1 for back). */
  to: string | number
  /** Parameters to build a dynamic path from a pattern. */
  params?: RouteParams
  /** If true, `history.replaceState` will be used instead of `history.pushState`. */
  replace?: boolean
  /** Additional state to be stored in the browser's history. */
  state?: Record<string, any>
}

/**
 * The payload for the `routeSync` event, containing all information about the new route.
 */
export interface RouteSyncPayload {
  path: string
  entityType: string
  params: RouteParams
  query: QueryParams
  hash: string
}

/**
 * API from @inglorious/store
 */
export type { Api as StoreApi } from "@inglorious/store"

/**
 * Client-side router for entity-based systems. Handles URL changes, link interception, and browser history management.
 */
export interface RouterType {
  /**
   * Initializes the router, sets up a popstate listener to handle browser navigation,
   * and intercepts clicks on local links.
   * @param entity The router state entity.
   * @param payload The initialization payload (currently unused).
   * @param api The store API for interacting with the system.
   */
  init(entity: RouterEntity, payload: any, api: Api): void

  /**
   * Navigates to a new route, updating the browser's history and the router entity state.
   * @param {RouterEntity} entity - The router entity.
   * @param {string|number|NavigatePayload} payload - The navigation payload.
   * Can be a path string, a number for `history.go()`, or an object with navigation options.
   * @param {string|number} payload.to - The destination path or history offset.
   * @param {RouteParams} [payload.params] - Route parameters to build the path from a pattern.
   * @param {boolean} [payload.replace] - If true, uses `history.replaceState` instead of `pushState`.
   * @param {Record<string, any>} [payload.state] - Additional state to store in the browser's history.
   * @param {StoreApi} api - The store API.
   */
  navigate(
    entity: RouterEntity,
    payload: string | number | NavigatePayload,
    api: Api,
  ): void | Promise<void>

  /**
   * Synchronizes the router entity's state with data from a routing event,
   * typically triggered by a `popstate` event (browser back/forward).
   * @param {RouterEntity} entity - The router entity to update.
   * @param {RouteSyncPayload} payload - The new route state.
   * @param {StoreApi} api - The store API.
   */
  routeSync(entity: RouterEntity, payload: RouteSyncPayload, api: Api): void
  /**
   * Handles browser `popstate` events. May perform async loading for lazy routes.
   */
  popstate(entity: RouterEntity, payload: any, api: Api): void | Promise<void>

  /**
   * Handles successful async route loading for a pattern.
   * Registers the loaded type and updates runtime route config.
   */
  routeLoadSuccess(entity: RouterEntity, payload: any, api: Api): void

  /**
   * Handles errors that occurred while loading a lazy route.
   */
  routeLoadError(entity: RouterEntity, payload: any): void
}

export declare const Router: RouterType

/**
 * Returns the current route configuration.
 * @returns {Record<string, string|function>} The current route configuration.
 */
export function getRoutes(): Record<string, string | (() => Promise<any>)>

/**
 * Retrieves a single route configuration given its path.
 * @param {string} path - The path of the route to retrieve.
 * @returns {string|function|undefined} The route configuration or undefined if not found.
 */
export function getRoute(path: string): string | (() => Promise<any>)

/**
 * Sets or updates routes in the route configuration.
 * Can be used both during initialization and at any point to add or update routes dynamically.
 * @param routes An object mapping route paths/patterns to entity type names or loader functions.
 */
export function setRoutes(
  routes: Record<string, string | (() => Promise<any>)>,
): void

/**
 * Adds a single route to the route configuration.
 * @param path The route path or pattern (e.g., "/users/:userId").
 * @param route The entity type name or a function that dynamically loads it.
 */
export function addRoute(
  path: string,
  route: string | (() => Promise<any>),
): void

/**
 * Removes a route from the route configuration.
 * @param path The route path or pattern to remove.
 */
export function removeRoute(path: string): void
