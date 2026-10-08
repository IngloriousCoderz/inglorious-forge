import { createGame } from "@inglorious/engine/test"
import { beforeEach, describe, test } from "vitest"

import gameConfig from "../src/game.ijs"

/**
 * Every state the game passes through, in order.
 *
 * Nothing is flown here, so the bird falls, misses a pipe and the game ends: the states
 * are recorded as they pass rather than waited for one at a time.
 */
const states = (game, frames = 400) => {
  const seen = [game.entity("game").state]

  for (let i = 0; i < frames; i++) {
    game.step()

    const now = game.entity("game").state

    if (seen.at(-1) !== now) seen.push(now)
  }

  return seen
}

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
    game.check(
      game.entity("game").state === "title",
      "the game waits on the title screen",
    )
    game.check(
      game.entity("title").value === "Inglorious Flapper",
      "which says what it is",
    )
    game.check(
      game.entity("countdown").value === "",
      "and nothing else is said yet",
    )
  })

  test("begins the countdown on a press", () => {
    // given
    game.step(4)

    // when
    game.press("Enter")

    // then
    game.check(
      game.entity("game").state === "countdown",
      "pressing begins the countdown",
    )
    game.check(game.entity("countdown").value !== "", "which is counted down")
  })

  test("counts down into the play", () => {
    // given
    game.step(4)
    game.press("Enter")

    // when
    const seen = states(game)

    // then
    game.check(seen[0] === "countdown", "the countdown runs")
    game.check(seen.includes("play"), "and it runs into the play")
  })

  test("ends an unplayed bird", () => {
    // given
    game.step(4)
    game.press("Enter")

    // when
    const seen = states(game)

    // then
    game.check(
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
    game.check(game.entity("game").state === "score", "the game is over")
    game.check(
      game.entity("gameOver").value === "Oof! You lost!",
      "which says so",
    )
    game.check(
      game.entity("gameOverScore").value !== "",
      "and shows what it came to",
    )
  })
})
