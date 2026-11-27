/**
 * Turns held input into movement flags on an entity: `true` while a key or button
 * is held, and the axis's value for a stick, from -1 to 1.
 *
 * Each handler is named after the action it answers to, so it needs no addressing:
 * the store already broadcasts `moveLeft` to every type that handles it, and the
 * movement is stored on whichever entity asked for these.
 *
 * @example
 * ```js
 * const Actor = [modernControls(), createMovementEventHandlers(["moveLeft"])]
 * ```
 */
export function createMovementEventHandlers(events) {
  return events.reduce((acc, eventName) => {
    acc[eventName] = (entity, payload) => {
      entity.movement ??= {}
      entity.movement[eventName] = payload?.value ?? true
    }

    acc[`${eventName}End`] = (entity) => {
      if (!entity.movement) return

      entity.movement[eventName] = false
    }

    return acc
  }, {})
}
