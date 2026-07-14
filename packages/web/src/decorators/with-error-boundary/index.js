/**
 * @typedef {import("../../../types/mount").Api} Api
 */

/**
 * Wraps a type's `render` in an error boundary. If the base render throws
 * synchronously, the caught error is handed to `fallback` and its template is
 * rendered instead — so one failing entity degrades to a fallback UI rather
 * than taking down the whole app (every child is rendered through the same
 * `render`, so there is no isolation without this).
 *
 * Because the wrap is deterministic, the *same* error produces the *same*
 * fallback during SSR and during client hydration, so it never introduces a
 * hydration mismatch.
 *
 * NOTE: like React/Svelte boundaries, this only catches errors thrown *during
 * render*. Errors thrown later — in event handlers, async work (thunks), or in
 * lit-html directives committed after `render` returns — are not caught here.
 * Those are the store phase, not the render phase: handle them as entity
 * `error` state in your handlers (see e.g. the geolocation type).
 *
 * @param {(error: Error, entity: object, api: Api) => unknown} [fallback]
 *   Renders the fallback UI. Receives the caught error, the entity, and the
 *   render api. Defaults to logging the error and rendering nothing.
 * @returns {(type: object) => { render: (entity: object, api: Api) => unknown }}
 *
 * @example
 * // Compose after the base type so the boundary wraps its render.
 * const types = {
 *   Chart: [ChartBase, withErrorBoundary((err) => html`<p>Chart failed: ${err.message}</p>`)],
 * }
 */
export function withErrorBoundary(fallback = defaultFallback) {
  return (type) => ({
    render(entity, api) {
      try {
        return type.render?.(entity, api) ?? ""
      } catch (error) {
        return fallback(error, entity, api)
      }
    },
  })
}

function defaultFallback(error) {
  console.error("[withErrorBoundary] render failed:", error)
  return ""
}
