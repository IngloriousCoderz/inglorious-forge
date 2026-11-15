import { dueAt } from "../animation/due.js"

const ONE_SECOND = 1

/**
 * A clock for a whole world that turns at its own rate: `atFps` for a world
 * rather than an entity. It notifies `tick` (or `event`) with the elapsed time
 * whenever a turn is due, so whatever turns with the world handles `tick`
 * instead of `update`, and is left alone between turns while the loop keeps
 * the pointer and controls at screen rate. It hears `pause` and `resume`
 * itself, since the store still asks systems for `update` while halted.
 *
 * @param {Object} [options]
 * @param {number} [options.fps=Infinity] - Turns a second. `Infinity` for one a frame.
 * @param {string} [options.event="tick"] - What a turn is called.
 * @returns {Object} The system.
 */
export function ticks({ fps = Infinity, event = "tick" } = {}) {
  const isDue = dueAt(ONE_SECOND / fps)

  let halted = false
  let clock = 0

  return {
    pause() {
      halted = true
    },

    resume() {
      halted = false
    },

    update(entities, dt, api) {
      if (halted) return

      const { since, elapsed } = isDue(clock, dt)

      clock = since

      if (elapsed === undefined) return

      api.notify(event, elapsed)
    },
  }
}
