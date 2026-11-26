import { createGame } from "@inglorious/engine/test.js"
import { v } from "@inglorious/utils/v.js"
import { beforeEach, describe, test } from "vitest"

import gameConfig from "../src/game.its"

describe("game", () => {
  let game

  beforeEach(() => {
    game = createGame(gameConfig)
  })

  test("moves the player with the arrow keys", () => {
    const [x] = game.entity("player").position

    game.step(4).hold("ArrowRight", 10)

    game.check(game.entity("player").position[0] > x, "the player moves right")
  })

  test("follows a finger on the screen", () => {
    const [x] = game.entity("player").position
    const finger = v(x + 100, 0, game.entity("player").position[2])

    game.notify("touchStart", { index: 0, position: finger }).step(10)

    game.check(
      game.entity("player").position[0] > x,
      "the player moves toward it",
    )
  })

  test("scores a point for each coin collected", () => {
    game.entity("player").position = game.entity("coin1").position

    game.step()

    game.check(game.entity("score").points === 1, "a coin is worth a point")
    game.check(
      game.entity("coin1").position !== game.entity("player").position,
      "and moves somewhere else",
    )
  })

  test("ends the round when time runs out", () => {
    game.advance(game.entity("game").timeLeft + 1)

    game.check(game.entity("game").state === "over", "the round is over")
    game.check(
      game.entity("score").value.includes("Time's up"),
      "and the score says so",
    )
  })

  test("starts a new round on space", () => {
    game.entity("score").points = 3
    game.advance(game.entity("game").timeLeft + 1)

    game.press("Space")

    game.check(game.entity("game").state === "play", "a new round starts")
    game.check(game.entity("score").points === 0, "with no points")
    game.check(game.entity("score").best === 3, "keeping the best score")
  })
})
