import { expect, vi } from "vitest"

import { Engine } from "./core/engine.js"

const DEFAULT_DT = 0.016
const DEFAULT_STEP_FRAMES = 1
const KEY_PRESS_SETTLING_FRAMES = 2
const DEFAULT_HOLD_FRAMES = 30

/**
 * A game to drive, with its sounds watched.
 *
 * `notify` is the one way anything is said to it, so there is a single place that goes
 * through the store; `step`, `press` and `hold` are written on top of it rather than
 * beside it. A test that needs a world of its own makes one of these, so nothing is
 * shared and tests can be run in any order.
 *
 * A game with a move of its own adds it rather than editing this: the additions are laid
 * over the top, so they can call everything here.
 *
 * @param {Object} gameConfig - The game's own config, as the browser would be given it.
 * @param {Object} [extendWith] - Methods this game's tests need of their own.
 *
 * @returns {Object} The game under test.
 *
 * @example
 * const game = createGame(gameConfig, {
 *   // Breakout: a ball that falls off the bottom costs a life.
 *   dropTheBall() {
 *     this.entity("ball").position[1] = 0
 *     return this.step(1)
 *   },
 * })
 */
export function createGame(gameConfig, extendWith = {}) {
  // Dev mode makes the store freeze what it publishes, which is right for a game being
  // looked at in a browser and wrong for a test that has to put a ball where a brick is.
  // Set here rather than in each test file, where it depends on being done before the
  // first game is made.
  gameConfig.entities.game.devMode = false

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

    /** One entity, by the name the game knows it by. */
    entity: (id) => engine._store.getEntity(id),
    state: () => engine._store.getState(),

    /** The one way anything is said to the game. */
    notify(event, ...args) {
      engine._store.notify(event, ...args)

      return this
    },

    /** Run frames. */
    step(frames = DEFAULT_STEP_FRAMES) {
      for (let i = 0; i < frames; i++) engine.update(DEFAULT_DT)

      return this
    },

    /** Tap a key: down, up, then a short settling period for it to be seen in. */
    press(code) {
      return this.notify("keyboardKeyDown", code)
        .notify("keyboardKeyUp", code)
        .step(KEY_PRESS_SETTLING_FRAMES)
    },

    /** Hold a key down for a while, then let it up. */
    hold(code, frames = DEFAULT_HOLD_FRAMES) {
      return this.notify("keyboardKeyDown", code)
        .step(frames)
        .notify("keyboardKeyUp", code)
        .step(KEY_PRESS_SETTLING_FRAMES)
    },

    ...extendWith,
  }
}

/**
 * An assertion that says what it was about.
 *
 * A failing `expect` without a description is one you have to go and find; with one, the
 * failure names the thing that stopped being true.
 *
 * @param {boolean} condition - What is being claimed.
 * @param {string} description - What is claimed, said as a fact about the game.
 * @returns {void}
 */
export function check(condition, description) {
  expect(condition, description).toBe(true)
}
