import { debounce } from "@inglorious/utils/functions/functions.js"

/**
 * Wraps selected event handlers of a type with debouncing, scoped per-entity.
 *
 * IMPORTANT: because state is managed with `mutative`, the `entity` object
 * passed into a handler is a draft proxy that gets revoked as soon as the
 * current update tick finishes. Debounced calls fire *later*, on their own
 * timer, well after that draft is dead. So we must never close over `entity`
 * itself across the debounce boundary — only its primitive `id`. When the
 * debounced callback actually runs, we re-fetch a live entity from the
 * current state via `api.getEntity(entityId)`. Primitives and `payload` are safe to
 * hold onto as-is; only draft/entity references are not.
 *
 * @param {number|Object} config - Either a single delay (ms) applied to all
 *   handlers listed in `handlerNames`, or a map of handlerName -> delay (ms).
 * @param {string[]} [handlerNames] - Handler names to debounce. Required when
 *   `config` is a single number; ignored when `config` is a map (its keys
 *   are used instead).
 *
 * @example
 * // same delay for every listed handler
 * const types = {
 *   AutosaveForm: [Form, withDebounce(500, ["saveData"])],
 * }
 *
 * @example
 * // per-handler delays
 * const types = {
 *   SearchBox: [Combobox, withDebounce({ optionsLoad: 300, saveQuery: 800 })],
 * }
 */
export function withDebounce(config, handlerNames) {
  const delays =
    typeof config === "number"
      ? Object.fromEntries(handlerNames.map((name) => [name, config]))
      : config

  return (type) => {
    // one debounced-fn map per entity, so instances don't share timers
    const debouncedByEntity = new Map()

    const behavior = {}

    for (const handlerName of Object.keys(delays)) {
      const originalHandler = type[handlerName]
      if (!originalHandler) continue // nothing to wrap if the base type doesn't define it

      behavior[handlerName] = (entity, payload, api) => {
        const entityId = entity.id // capture the primitive now, while the draft is live

        let perEntity = debouncedByEntity.get(entityId)
        if (!perEntity) {
          perEntity = {}
          debouncedByEntity.set(entityId, perEntity)
        }

        if (!perEntity[handlerName]) {
          perEntity[handlerName] = debounce((entityId, payload, api) => {
            const liveEntity = api.getEntity(entityId) // fresh, live reference
            if (!liveEntity) return // entity was destroyed before the debounce fired
            originalHandler(liveEntity, payload, api)
          }, delays[handlerName])
        }

        perEntity[handlerName](entityId, payload, api)
      }
    }

    // clean up any pending timers when the entity is destroyed
    behavior.destroy = (entity, payload, api) => {
      const entityId = entity.id // same rule applies here: capture before it's gone

      const perEntity = debouncedByEntity.get(entityId)
      if (perEntity) {
        Object.values(perEntity).forEach((d) => d.cancel())
        debouncedByEntity.delete(entityId)
      }

      type.destroy?.(entity, payload, api)
    }

    return behavior
  }
}
