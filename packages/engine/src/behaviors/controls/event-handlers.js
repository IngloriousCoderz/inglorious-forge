/**
 * Turns held input into movement flags on an entity.
 *
 * Each handler is named after the action it answers to, so it needs no addressing:
 * the store already broadcasts `moveLeft` to every type that handles it, and the
 * movement is stored on whichever entity asked for these.
 *
 * @example
 * ```js
 * const Paddle = [modernControls(), createMovementEventHandlers(["moveLeft"])]
 * ```
 */
export function createMovementEventHandlers(events) {
  return events.reduce((acc, eventName) => {
    acc[eventName] = (entity) => {
      entity.movement ??= {}
      entity.movement[eventName] = true
    }

    acc[`${eventName}End`] = (entity) => {
      if (!entity.movement) return

      entity.movement[eventName] = false
    }

    return acc
  }, {})
}
