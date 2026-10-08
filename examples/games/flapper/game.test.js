import "./smoke-setup.js"

import { Engine } from "@inglorious/engine/core/engine.js"
import { beforeEach, describe, expect, test } from "vitest"

import gameConfig from "./src/game.ijs"

gameConfig.entities.game.devMode = false

function createGame() {
  const engine = new Engine(gameConfig)

  return {
    engine,
    state: () => engine.getState(),
    step(frames = 1) {
      for (let i = 0; i < frames; i++) engine.update(1 / 60)
    },
    press() {
      engine._store.notify("keyboardKeyDown", "Enter")
      engine._store.notify("keyboardKeyUp", "Enter")
      this.step(2)
    },
    /**
     * Every state the game passes through, in order.
     *
     * Nothing is flown here, so the bird falls, misses a pipe and the game ends: the
     * states are recorded as they pass rather than waited for one at a time.
     */
    states(frames = 400) {
      const seen = [this.state().game.state]

      for (let i = 0; i < frames; i++) {
        this.step()

        if (seen.at(-1) !== this.state().game.state)
          seen.push(this.state().game.state)
      }

      return seen
    },
  }
}

const game = (game) => game.state().game
const title = (game) => game.state().title
const countdown = (game) => game.state().countdown
const score = (game) => game.state().score
const gameOver = (game) => game.state().gameOver
const gameOverScore = (game) => game.state().gameOverScore

const check = (condition, description) =>
  expect(condition, description).toBe(true)

describe("Flapper", () => {
  let _game

  beforeEach(() => {
    _game = createGame()
  })

  test("waits on the title screen", () => {
    // given
    _game.step(4)

    // when
    _game.step()

    // then
    check(game(_game).state === "title", "the game waits on the title screen")
    check(title(_game).value === "Inglorious Flapper", "which says what it is")
    check(countdown(_game).value === "", "and nothing else is said yet")
  })

  test("begins the countdown on a press", () => {
    // given
    _game.step(4)

    // when
    _game.press()

    // then
    check(game(_game).state === "countdown", "pressing begins the countdown")
    check(countdown(_game).value !== "", "which is counted down")
  })

  test("counts down into the play", () => {
    // given
    _game.step(4)
    _game.press()

    // when
    const seen = _game.states()

    // then
    check(seen[0] === "countdown", "the countdown runs")
    check(seen.includes("play"), "and it runs into the play")
  })

  test("ends an unplayed bird", () => {
    // given
    _game.step(4)
    _game.press()

    // when
    const seen = _game.states()

    // then
    check(
      seen.includes("score"),
      "an unplayed bird reaches the end of the game",
    )
  })

  test("says what happened when it is over", () => {
    // given
    _game.step(4)
    _game.press()
    _game.states()

    // when
    _game.step()

    // then
    check(game(_game).state === "score", "the game is over")
    check(gameOver(_game).value === "Oof! You lost!", "which says so")
    check(gameOverScore(_game).value !== "", "and shows what it came to")
  })
})
