/**
 * A `routeChange` handler for a page entity: `open` when the route resolved to
 * it, `close` when it resolved elsewhere. Each step is optional.
 * @param {object} [handlers]
 * @param {(payload: object) => unknown} [handlers.select] - Picks what `open` needs from the route, such as a param.
 * @param {(entity: object, selected: unknown, api: object) => void} [handlers.open]
 * @param {(entity: object, api: object) => void} [handlers.close]
 * @returns {(entity: object, payload: object, api: object) => void}
 */
export function pageRouteChange({ select, open, close } = {}) {
  return function routeChange(entity, payload, api) {
    // The payload, not the router entity: inside the router's own notify, the
    // entity still names the route being left.
    if (payload.route !== entity.id) {
      close?.(entity, api)
      return
    }
    open?.(entity, select?.(payload), api)
  }
}
