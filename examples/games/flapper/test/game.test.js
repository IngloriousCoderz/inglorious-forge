import "./test-setup.js"

import { beforeEach, describe, expect, test } from "vitest"

import gameConfig from "../src/game.ijs"
import { createGame } from "./test-harness.js"

gameConfig.entities.game.devMode = false

/**
 * Every state the game passes through, in order.
 *
 * Nothing is flown here, so the bird falls, misses a pipe and the game ends: the states
 * are recorded as they pass rather than waited for one at a time.
 */
const states = (_game, frames = 400) => {
  const seen = [_game.entity("game").state]

  for (let i = 0; i < frames; i++) {
    _game.step()

    const now = _game.entity("game").state

    if (seen.at(-1) !== now) seen.push(now)
  }

  return seen
}

const check = (condition, description) =>
  expect(condition, description).toBe(true)

describe("Flapper", () => {
  let game

  beforeEach(() => {
    game = createGame(gameConfig)
  })

  test("waits on the title screen", () => {
    // given
    game.step(4)

    // when
    game.step()

    // then
    check(
      game.entity("game").state === "title",
      "the game waits on the title screen",
    )
    check(
      game.entity("title").value === "Inglorious Flapper",
      "which says what it is",
    )
    check(game.entity("countdown").value === "", "and nothing else is said yet")
  })

  test("begins the countdown on a press", () => {
    // given
    game.step(4)

    // when
    game.press("Enter")

    // then
    check(
      game.entity("game").state === "countdown",
      "pressing begins the countdown",
    )
    check(game.entity("countdown").value !== "", "which is counted down")
  })

  test("counts down into the play", () => {
    // given
    game.step(4)
    game.press("Enter")

    // when
    const seen = states(game)

    // then
    check(seen[0] === "countdown", "the countdown runs")
    check(seen.includes("play"), "and it runs into the play")
  })

  test("ends an unplayed bird", () => {
    // given
    game.step(4)
    game.press("Enter")

    // when
    const seen = states(game)

    // then
    check(
      seen.includes("score"),
      "an unplayed bird reaches the end of the game",
    )
  })

  test("says what happened when it is over", () => {
    // given
    game.step(4)
    game.press("Enter")
    states(game)

    // when
    game.step()

    // then
    check(game.entity("game").state === "score", "the game is over")
    check(game.entity("gameOver").value === "Oof! You lost!", "which says so")
    check(
      game.entity("gameOverScore").value !== "",
      "and shows what it came to",
    )
  })
})
