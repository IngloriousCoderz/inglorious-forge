import { createGame } from "@inglorious/engine/test.js"
import { v } from "@inglorious/utils/v.js"
import { beforeEach, describe, test } from "vitest"

import gameConfig from "@/game.ts"
import type { CoinEntity, GameEntity, PlayerEntity, ScoreEntity } from "#types"

describe("game", () => {
  let game: ReturnType<typeof createGame>

  beforeEach(() => {
    game = createGame(gameConfig)
  })

  test("moves the player with the arrow keys", () => {
    const [x] = game.entity<PlayerEntity>("player").position

    game.step(4).hold("ArrowRight", 10)

    game.check(
      game.entity<PlayerEntity>("player").position[0] > x,
      "the player moves right",
    )
  })

  test("follows a finger on the screen", () => {
    const [x] = game.entity<PlayerEntity>("player").position
    const finger = v(
      x + 100,
      0,
      game.entity<PlayerEntity>("player").position[2],
    )

    game.notify("touchStart", { index: 0, position: finger }).step(10)

    game.check(
      game.entity<PlayerEntity>("player").position[0] > x,
      "the player moves toward it",
    )
  })

  test("scores a point for each coin collected", () => {
    game.entity<PlayerEntity>("player").position =
      game.entity<CoinEntity>("coin1").position

    game.step()

    game.check(
      game.entity<ScoreEntity>("score").points === 1,
      "a coin is worth a point",
    )
    game.check(
      game.entity<CoinEntity>("coin1").position !==
        game.entity<PlayerEntity>("player").position,
      "and moves somewhere else",
    )
  })

  test("ends the round when time runs out", () => {
    game.advance(game.entity<GameEntity>("game").timeLeft + 1)

    game.check(
      game.entity<GameEntity>("game").state === "over",
      "the round is over",
    )
    game.check(
      game.entity<ScoreEntity>("score").value.includes("Time's up"),
      "and the score says so",
    )
  })

  test("starts a new round on space", () => {
    game.entity<ScoreEntity>("score").points = 3
    game.advance(game.entity<GameEntity>("game").timeLeft + 1)

    game.press("Space")

    game.check(
      game.entity<GameEntity>("game").state === "play",
      "a new round starts",
    )
    game.check(game.entity<ScoreEntity>("score").points === 0, "with no points")
    game.check(
      game.entity<ScoreEntity>("score").best === 3,
      "keeping the best score",
    )
  })
})
