import { throttle } from "@inglorious/utils/functions"

/**
 * Wraps selected event handlers of a type with throttling, scoped per-entity.
 *
 * By default this is leading-edge only: the first call in a burst runs
 * immediately, and further calls are dropped until `delay` has elapsed — the
 * last call of a burst may be lost. Pass `{ hasTrailing: true }` to also invoke
 * the handler once more after `delay`, using the most recent suppressed
 * call's arguments, so the final state of a burst is never dropped.
 *
 * Every call that gets through notifies `#id:<handler>Throttled`, which runs
 * the original handler inside an update with a live draft: a trailing call
 * fires on its own timer, outside any update, after the event's draft is
 * revoked. An entity destroyed in the meantime gets nothing.
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
    const throttledByEntity = new Map()

    const behavior = {}

    for (const handlerName of Object.keys(delays)) {
      const originalHandler = type[handlerName]
      if (!originalHandler) continue

      const throttledEvent = `${handlerName}Throttled`
      behavior[throttledEvent] = originalHandler

      behavior[handlerName] = (entity, payload, api) => {
        const entityId = entity.id

        let perEntity = throttledByEntity.get(entityId)
        if (!perEntity) {
          perEntity = {}
          throttledByEntity.set(entityId, perEntity)
        }

        if (!perEntity[handlerName]) {
          perEntity[handlerName] = throttle(
            (entityId, payload, api) => {
              api.notify(`#${entityId}:${throttledEvent}`, payload)
            },
            delays[handlerName],
            { hasTrailing },
          )
        }

        perEntity[handlerName](entityId, payload, api)
      }
    }

    behavior.destroy = (entity, payload, api) => {
      const entityId = entity.id

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
