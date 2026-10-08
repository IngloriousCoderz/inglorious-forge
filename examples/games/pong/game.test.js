import "./smoke-setup.js"

import { Engine } from "@inglorious/engine/core/engine.js"
import { beforeEach, describe, expect, test } from "vitest"

import gameConfig from "./src/game.ijs"

const X = 0
const Z = 2

gameConfig.entities.game.devMode = false

/**
 * A game of its own, with nothing said to it yet.
 *
 * Nothing here is shared between tests: each one gets an engine of its own and states
 * everything it needs in its `given`. A test that inherits from the one before it can
 * only be run in one order, which is the thing worth avoiding.
 */
function createGame() {
  const engine = new Engine(gameConfig)

  return {
    engine,
    state: () => engine.getState(),
    step(frames = 1) {
      for (let i = 0; i < frames; i++) engine.update(1 / 60)
    },
    press() {
      engine._store.notify("keyboardKeyDown", "Space")
      engine._store.notify("keyboardKeyUp", "Space")
      this.step(2)
    },
    /** Start, choose a paddle, and get into the play. */
    intoPlay() {
      this.step(4)
      this.press()
      this.press()
    },
  }
}

const game = (game) => game.state().game
const score = (game) => game.state().score
const ball = (game) => game.state().ball
const message = (game) => game.state().message

const check = (condition, description) =>
  expect(condition, description).toBe(true)

describe("Pong", () => {
  let _game

  beforeEach(() => {
    _game = createGame()
  })

  test("waits to be started", () => {
    // given
    _game.step(4)

    // when
    _game.step()

    // then
    check(game(_game).state === "start", "the game waits to be started")
    check(game(_game).servingPlayer === "player1", "with player one to serve")
    check(
      score(_game).player1 === 0 && score(_game).player2 === 0,
      "and no score",
    )
  })

  test("begins the serve on space", () => {
    // given
    _game.step(4)

    // when
    _game.press()

    // then
    check(game(_game).state === "serve", "space begins the serve")
    check(
      message(_game).value.includes("Player 1's serve"),
      "which says who is serving",
    )
  })

  test("goes into play on a second space", () => {
    // given
    _game.step(4)
    _game.press()

    // when
    _game.press()

    // then
    check(game(_game).state === "play", "space again puts it in play")
    check(message(_game).value === "", "and the message goes away")
    check(game(_game).paused === undefined, "nothing is paused")
  })

  test("serves a ball that travels", () => {
    // given
    _game.intoPlay()

    const heading = ball(_game).orientation
    const from = ball(_game).position

    // when
    _game.step(10)

    // then
    check(ball(_game).position !== from, "the ball moves")
    check(ball(_game).orientation === heading, "on the heading it was served")
  })

  test("turns a ball back at a wall", () => {
    // given
    _game.intoPlay()

    const heading = ball(_game).orientation
    ball(_game).position[Z] = -1

    // when
    _game.step()

    // then
    // Nothing clamps the position: a ball is reflected while it is still inside, so being
    // put back would never be needed.
    check(
      ball(_game).orientation !== heading,
      "a ball past a wall is turned back",
    )
  })

  test("scores a point for the player who was not serving", () => {
    // given
    _game.intoPlay()

    const scoring =
      game(_game).servingPlayer === "player1" ? "player2" : "player1"
    ball(_game).position[X] =
      scoring === "player1" ? game(_game).size[X] + 1 : -1

    // when
    _game.step()

    // then
    check(
      score(_game)[scoring] === 1,
      `a ball off the far side scores to ${scoring}`,
    )
    check(game(_game).state === "serve", "and the game serves again")
    check(
      game(_game).servingPlayer !== scoring,
      "with the player who conceded serving",
    )
  })

  test("ends once the score is reached", () => {
    // given
    _game.intoPlay()

    const winner = "player1"
    score(_game)[winner] = score(_game).maxScore - 1
    ball(_game).position[X] = game(_game).size[X] + 1

    // when
    _game.step()

    // then
    check(
      game(_game).state === "gameOver",
      "the game is over once the score is reached",
    )
    check(message(_game).value.includes("wins"), "and it says who won")
  })

  test("serves again with the score put back", () => {
    // given
    _game.intoPlay()

    score(_game).player1 = score(_game).maxScore
    ball(_game).position[X] = game(_game).size[X] + 1
    _game.step()

    // when
    _game.press()

    // then
    check(game(_game).state === "serve", "and space serves again")
    check(score(_game).player1 === 0, "with the score put back")
  })
})
