import { dueAt } from "@inglorious/engine/animation/due.js"

const ONE_SECOND = 1

/**
 * An entity that moves at its own rate rather than at the loop's.
 *
 * This is how a game says "this one moves every frame, that one moves ten times a
 * second": the loop stays as fast as the browser will take it -- which is what keeps
 * input and the screen smooth -- and each entity that wants to be slower keeps its own
 * time and is only updated when that time has run out.
 *
 * The rate is a ceiling and not a floor: a frame that leaves more time than the rate
 * allows carries all of it into the next update, so the entity still accounts for every
 * second that really went by.
 *
 * Put it **last** in a type's behaviors. Each one wraps the ones before it and calls on
 * to them, so the last one is the one the store reaches first; anywhere else it is
 * wrapped in turn and never gets a say.
 *
 * @param {number} fps - How many times a second this entity is updated. `Infinity` for
 *   every frame, which is also what the engine's default is.
 * @returns {Function} A behavior wrapping whatever it is put in front of.
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

      // The whole of the time this entity's turn covers, rather than the length of the
      // frame that happened to land on it: six frames of a sixtieth of a second are a
      // tenth of a second, and a game moving by velocity times dt has to move by all of
      // it or it runs six times too slowly for asking to move ten times a second.
      type.update?.(entity, elapsed, api)
    },
  })
}
