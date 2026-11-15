/**
 * Wraps selected handlers of a type so that each call goes through a limiter,
 * one per entity and handler, which notifies `#id:<handler><Suffix>` when the
 * call gets through. The original handler then runs in an update of its own,
 * with a live draft: a call that fires later, on a timer, is outside the update
 * that brought the event, when its draft is revoked. An entity destroyed in the
 * meantime gets nothing.
 *
 * @param {Object.<string, number>} delays - The handlers to wrap, by name, with their delay.
 * @param {string} suffix - What the event the limiter notifies ends with.
 * @param {(fn: Function, delay: number) => Function & { cancel(): void }} createLimiter
 * @returns {(type: object) => object} The behavior.
 */
export function withLimiter(delays, suffix, createLimiter) {
  return (type) => {
    const limitersByEntity = new Map()
    const behavior = {}

    for (const handlerName of Object.keys(delays)) {
      const originalHandler = type[handlerName]
      if (!originalHandler) continue

      const limitedEvent = `${handlerName}${suffix}`
      behavior[limitedEvent] = originalHandler

      behavior[handlerName] = (entity, payload, api) => {
        const entityId = entity.id

        let perEntity = limitersByEntity.get(entityId)
        if (!perEntity) {
          perEntity = {}
          limitersByEntity.set(entityId, perEntity)
        }

        perEntity[handlerName] ??= createLimiter((entityId, payload, api) => {
          api.notify(`#${entityId}:${limitedEvent}`, payload)
        }, delays[handlerName])

        perEntity[handlerName](entityId, payload, api)
      }
    }

    behavior.destroy = (entity, payload, api) => {
      const perEntity = limitersByEntity.get(entity.id)
      if (perEntity) {
        Object.values(perEntity).forEach((limiter) => limiter.cancel())
        limitersByEntity.delete(entity.id)
      }

      type.destroy?.(entity, payload, api)
    }

    return behavior
  }
}

/**
 * The delays by handler name, from either form of a decorator's arguments.
 * @param {number|Object.<string, number>} config - One delay for every handler listed, or a map of handler names to delays.
 * @param {string[]} [handlerNames] - The handlers, when `config` is one delay.
 * @returns {Object.<string, number>}
 */
export function toDelays(config, handlerNames) {
  return typeof config === "number"
    ? Object.fromEntries(handlerNames.map((name) => [name, config]))
    : config
}
