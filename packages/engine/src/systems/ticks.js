import { dueAt } from "../animation/due.js"

const ONE_SECOND = 1

/**
 * A clock for a whole world that turns at a rate of its own.
 *
 * This is `atFps` for a world rather than for an entity. A board where everything moves
 * together -- a generation of Life, a day for foxes and rabbits -- has one clock, kept
 * here, and notifies `tick` whenever a turn is due. Whatever turns with the world handles
 * `tick` instead of `update`, and the loop stays as fast as the screen takes it, so the
 * pointer and the controls never wait on the world.
 *
 * It is also what lets a large world be cheap between turns. An entity with `atFps` is
 * still handed every `update` to keep its own time, so every one of them is written to on
 * every frame; an entity that only handles `tick` is left alone until the world turns.
 *
 * The event carries the time the turn covers, as `atFps` does: six frames of a sixtieth
 * of a second are a tenth of a second, and a world moving by velocity times dt has to
 * move by all of it.
 *
 * Halting the store stops the entities updating, but systems are still asked, so the
 * clock hears the pause for itself. Without that the world would carry on turning
 * underneath a pause that everything else is honouring.
 *
 * @param {Object} [options] - How the world turns.
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

      // Notified rather than called, so that the turn reaches entities and systems alike,
      // in the same pass: the store drains the queue before it publishes, and anything
      // the turn notifies in its own right follows it in.
      api.notify(event, elapsed)
    },
  }
}
