let runtimeConfig = null

/**
 * @typedef {{
 *   createGrid: (element: HTMLElement, options: object) => any
 *   registerModules?: () => void
 * }} AgGridRuntimeConfig
 */

/**
 * Configures the AG Grid runtime used by the adapter.
 *
 * @param {AgGridRuntimeConfig} config
 */
export function configureAgGrid(config) {
  if (!config || typeof config.createGrid !== "function") {
    throw new TypeError(
      "configureAgGrid(config) requires a createGrid function.",
    )
  }

  if (
    config.registerModules !== undefined &&
    typeof config.registerModules !== "function"
  ) {
    throw new TypeError(
      "configureAgGrid(config) registerModules must be a function when provided.",
    )
  }

  runtimeConfig = {
    createGrid: config.createGrid,
    registerModules: config.registerModules || null,
  }
}

/**
 * Returns the configured AG Grid runtime.
 * Throws when runtime has not been configured yet.
 *
 * @returns {{ createGrid: (element: HTMLElement, options: object) => any, registerModules: (() => void) | null }}
 */
export function getAgGridRuntimeConfig() {
  if (runtimeConfig) return runtimeConfig

  throw new Error(
    "AG Grid runtime is not configured. Call configureAgGrid({ createGrid, registerModules? }) before mounting your app.",
  )
}
