import { throttle } from "@inglorious/utils/functions/functions.js"

/**
 * Wraps selected event handlers of a type with throttling, scoped per-entity.
 *
 * By default this is leading-edge only: the first call in a burst runs
 * immediately, and further calls are dropped until `delay` has elapsed — the
 * last call of a burst may be lost. Pass `{ hasTrailing: true }` to also invoke
 * the handler once more after `delay`, using the most recent suppressed
 * call's arguments, so the final state of a burst is never dropped.
 *
 * IMPORTANT: because state is managed with `mutative`, the `entity` object
 * passed into a handler is a draft proxy that gets revoked as soon as the
 * current update tick finishes. The leading call always runs synchronously
 * (same tick as the triggering event), so the draft is still live there —
 * but a trailing call (when `hasTrailing: true`) fires *later*, on its own
 * timer, after that draft is dead. To keep one code path safe for both
 * cases, we never close over `entity` itself across the throttle boundary —
 * only its primitive `id`. Every time the wrapped handler actually runs, we
 * re-fetch a live entity from the current state via `api.getEntity(entityId)`.
 * Primitives and `payload` are safe to hold onto as-is; only draft/entity
 * references are not.
 *
 * @param {number|Object} config - Either a single delay (ms) applied to all
 *   handlers listed in `handlerNames`, or a map of handlerName -> delay (ms).
 * @param {string[]} [handlerNames] - Handler names to throttle. Required when
 *   `config` is a single number; ignored when `config` is a map (its keys
 *   are used instead).
 * @param {Object} [options]
 * @param {boolean} [options.hasTrailing=false] - Whether throttled handlers
 *   should also fire once more after `delay`, using the last suppressed
 *   call's arguments. Applies to every handler wrapped by this call.
 *
 * @example
 * // leading-edge only (default): rate-limit a frequent event, last call in
 * // a burst may be dropped
 * const types = {
 *   ScrollTracker: [Base, withThrottle(200, ["scroll"])],
 * }
 *
 * @example
 * // leading + trailing: never lose the final call of a burst
 * const types = {
 *   ResizablePanel: [Base, withThrottle({ resize: 100 }, undefined, { hasTrailing: true })],
 * }
 */
export function withThrottle(
  config,
  handlerNames,
  { hasTrailing = false } = {},
) {
  const delays =
    typeof config === "number"
      ? Object.fromEntries(handlerNames.map((name) => [name, config]))
      : config

  return (type) => {
    // one throttled-fn map per entity, so instances don't share windows
    const throttledByEntity = new Map()

    const behavior = {}

    for (const handlerName of Object.keys(delays)) {
      const originalHandler = type[handlerName]
      if (!originalHandler) continue // nothing to wrap if the base type doesn't define it

      behavior[handlerName] = (entity, payload, api) => {
        const entityId = entity.id // capture the primitive now, while the draft is live

        let perEntity = throttledByEntity.get(entityId)
        if (!perEntity) {
          perEntity = {}
          throttledByEntity.set(entityId, perEntity)
        }

        if (!perEntity[handlerName]) {
          perEntity[handlerName] = throttle(
            (entityId, payload, api) => {
              const liveEntity = api.getEntity(entityId) // fresh, live reference
              if (!liveEntity) return // entity was destroyed before this fired
              originalHandler(liveEntity, payload, api)
            },
            delays[handlerName],
            { hasTrailing },
          )
        }

        perEntity[handlerName](entityId, payload, api)
      }
    }

    // clean up any pending windows/trailing calls when the entity is destroyed
    behavior.destroy = (entity, payload, api) => {
      const entityId = entity.id // same rule applies here: capture before it's gone

      const perEntity = throttledByEntity.get(entityId)
      if (perEntity) {
        Object.values(perEntity).forEach((t) => t.cancel())
        throttledByEntity.delete(entityId)
      }

      type.destroy?.(entity, payload, api)
    }

    return behavior
  }
}
