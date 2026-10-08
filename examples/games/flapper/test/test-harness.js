import { Engine } from "@inglorious/engine/core/engine.js"
import { vi } from "vitest"

/**
 * A game to drive, with its sounds watched.
 *
 * `notify` is the one way anything is said to it -- a key, a quit, anything else -- so
 * there is a single place that goes through the store. `step`, `press` and `hold` are the
 * shapes a test actually says things in, written on top of it rather than beside it.
 *
 * A test that needs a world of its own makes one of these. Nothing is shared between
 * them, so tests can be run in any order.
 */
export function createGame(gameConfig) {
  const engine = new Engine(gameConfig)
  const played = []

  // Sounds are watched where they are handled rather than where they are asked for, so
  // this records what the game actually reached for. Recording the request instead would
  // not catch a sound wired to the wrong state.
  vi.spyOn(engine._store.getType("Audio"), "soundPlay").mockImplementation(
    function soundPlay(entity, name) {
      played.push(name)
    },
  )

  return {
    engine,
    store: engine._store,
    played,

    /** One entity, by the id it is known by in the game. */
    entity: (id) => engine._store.getEntity(id),
    state: () => engine._store.getState(),

    /** The one way anything is said to the game. */
    notify(event, ...args) {
      engine._store.notify(event, ...args)

      return this
    },

    /** Run frames. */
    step(frames = 1) {
      for (let i = 0; i < frames; i++) engine.update(1 / 60)

      return this
    },

    /** Tap a key: down, up, then two frames for it to be seen in. */
    press(code) {
      return this.notify("keyboardKeyDown", code)
        .notify("keyboardKeyUp", code)
        .step(2)
    },

    /** Hold a key down for a while, then let it up. */
    hold(code, frames = 30) {
      return this.notify("keyboardKeyDown", code)
        .step(frames)
        .notify("keyboardKeyUp", code)
        .step(2)
    },
  }
}
