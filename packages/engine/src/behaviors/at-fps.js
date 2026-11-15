import { dueAt } from "../animation/due.js"

const ONE_SECOND = 1

/**
 * Updates an entity at its own rate rather than the loop's: the loop stays as
 * fast as the screen, and the entity's `update` runs only when its interval
 * has passed, with all the time since its last one. Put it last in the type's
 * behaviors, so it wraps the `update` it holds back.
 *
 * @param {number} fps - Updates a second. `Infinity` for every frame.
 * @returns {Function} The behavior.
 */
export function atFps(fps) {
  const isDue = dueAt(ONE_SECOND / fps)

  return (type) => ({
    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      entity.fpsClock = 0
    },

    update(entity, dt, api) {
      const { elapsed, since } = isDue(entity.fpsClock, dt)

      entity.fpsClock = since

      if (elapsed === undefined) return

      type.update?.(entity, elapsed, api)
    },
  })
}
