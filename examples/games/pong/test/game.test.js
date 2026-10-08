import { createGame } from "@inglorious/engine/test"
import { beforeEach, describe, test } from "vitest"

import gameConfig from "../src/game.ijs"

const X = 0
const Z = 2

/** Start, choose a paddle, and get into the play. */
const intoPlay = (game) => game.step(4).press("Space").press("Space")

describe("Pong", () => {
  let game

  beforeEach(() => {
    game = createGame(gameConfig)
  })

  test("waits to be started", () => {
    // given
    game.step(4)

    // when
    game.step()

    // then
    game.check(
      game.entity("game").state === "start",
      "the game waits to be started",
    )
    game.check(
      game.entity("game").servingPlayer === "player1",
      "with player one to serve",
    )
    game.check(
      game.entity("score").player1 === 0 && game.entity("score").player2 === 0,
      "and no score",
    )
  })

  test("begins the serve on space", () => {
    // given
    game.step(4)

    // when
    game.press("Space")

    // then
    game.check(game.entity("game").state === "serve", "space begins the serve")
    game.check(
      game.entity("message").value.includes("Player 1's serve"),
      "which says who is serving",
    )
  })

  test("goes into play on a second space", () => {
    // given
    game.step(4)
    game.press("Space")

    // when
    game.press("Space")

    // then
    game.check(
      game.entity("game").state === "play",
      "space again puts it in play",
    )
    game.check(game.entity("message").value === "", "and the message goes away")
    game.check(game.entity("game").paused === undefined, "nothing is paused")
  })

  test("serves a ball that travels", () => {
    // given
    intoPlay(game)

    const heading = game.entity("ball").orientation
    const from = game.entity("ball").position

    // when
    game.step(10)

    // then
    game.check(game.entity("ball").position !== from, "the ball moves")
    game.check(
      game.entity("ball").orientation === heading,
      "on the heading it was served",
    )
  })

  test("turns a ball back at a wall", () => {
    // given
    intoPlay(game)

    const heading = game.entity("ball").orientation
    game.entity("ball").position[Z] = -1

    // when
    game.step()

    // then
    // Nothing clamps the position: a ball is reflected while it is still inside, so being
    // put back would never be needed.
    game.check(
      game.entity("ball").orientation !== heading,
      "a ball past a wall is turned back",
    )
  })

  test("scores a point for the player who was not serving", () => {
    // given
    intoPlay(game)

    const scoring =
      game.entity("game").servingPlayer === "player1" ? "player2" : "player1"
    game.entity("ball").position[X] =
      scoring === "player1" ? game.entity("game").size[X] + 1 : -1

    // when
    game.step()

    // then
    game.check(
      game.entity("score")[scoring] === 1,
      `a ball off the far side scores to ${scoring}`,
    )
    game.check(
      game.entity("game").state === "serve",
      "and the game serves again",
    )
    game.check(
      game.entity("game").servingPlayer !== scoring,
      "with the player who conceded serving",
    )
  })

  test("ends once the score is reached", () => {
    // given
    intoPlay(game)

    const winner = "player1"
    game.entity("score")[winner] = game.entity("score").maxScore - 1
    game.entity("ball").position[X] = game.entity("game").size[X] + 1

    // when
    game.step()

    // then
    game.check(
      game.entity("game").state === "gameOver",
      "the game is over once the score is reached",
    )
    game.check(
      game.entity("message").value.includes("wins"),
      "and it says who won",
    )
  })

  test("serves again with the score put back", () => {
    // given
    intoPlay(game)

    game.entity("score").player1 = game.entity("score").maxScore
    game.entity("ball").position[X] = game.entity("game").size[X] + 1
    game.step()

    // when
    game.press("Space")

    // then
    game.check(game.entity("game").state === "serve", "and space serves again")
    game.check(game.entity("score").player1 === 0, "with the score put back")
  })
})
