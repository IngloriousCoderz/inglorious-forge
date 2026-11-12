import { debounce } from "@inglorious/utils/functions"

/**
 * Wraps selected event handlers of a type with debouncing, scoped per-entity.
 *
 * A debounced call fires later, on its own timer, outside any update: the
 * entity the event brought is a draft revoked by then. So the timer notifies
 * `#id:<handler>Debounced`, which runs the original handler inside an update
 * of its own, with a live draft whose changes reach subscribers. An entity
 * destroyed in the meantime gets nothing.
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
    const debouncedByEntity = new Map()

    const behavior = {}

    for (const handlerName of Object.keys(delays)) {
      const originalHandler = type[handlerName]
      if (!originalHandler) continue

      const debouncedEvent = `${handlerName}Debounced`
      behavior[debouncedEvent] = originalHandler

      behavior[handlerName] = (entity, payload, api) => {
        const entityId = entity.id

        let perEntity = debouncedByEntity.get(entityId)
        if (!perEntity) {
          perEntity = {}
          debouncedByEntity.set(entityId, perEntity)
        }

        if (!perEntity[handlerName]) {
          perEntity[handlerName] = debounce((entityId, payload, api) => {
            api.notify(`#${entityId}:${debouncedEvent}`, payload)
          }, delays[handlerName])
        }

        perEntity[handlerName](entityId, payload, api)
      }
    }

    behavior.destroy = (entity, payload, api) => {
      const entityId = entity.id

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
