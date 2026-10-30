import { createGame } from "@inglorious/engine/test"
import { describe, expect, test } from "vitest"

import { createGameOfLife } from "../src/game-of-life/index.js"

const A_GENERATION = 1

const EVERY_FRAME = Infinity

const FRAMES_SHORT_OF_A_TENTH = 6
const FRAMES_A_TENTH = 7

const A_BLINKER_CYCLE = 2
const A_GLIDER_JOURNEY = 4

const ACROSS_THE_EDGE = [
  [
    [0, 0],
    [79, 119],
  ],
]

describe("Conway's Game of Life", () => {
  test("a cell on its own dies, having nothing to keep it alive", () => {
    const game = createGame(
      createGameOfLife({ patterns: [[[10, 10]]], fps: EVERY_FRAME }),
    )

    game.step(A_GENERATION)

    expect(living(game)).toEqual([])
  })

  test("a block of four stays exactly where it is", () => {
    const game = createGame(
      createGameOfLife({
        patterns: [
          [
            [10, 10],
            [10, 11],
            [11, 10],
            [11, 11],
          ],
        ],
        fps: EVERY_FRAME,
      }),
    )

    game.step(8 * A_GENERATION)

    expect(living(game)).toEqual(["10,10", "10,11", "11,10", "11,11"])
  })

  test("a blinker turns over and then back again", () => {
    const game = createGame(
      createGameOfLife({
        patterns: [
          [
            [20, 20],
            [20, 21],
            [20, 22],
          ],
        ],
        fps: EVERY_FRAME,
      }),
    )

    game.step(A_GENERATION)

    expect(living(game)).toEqual(["19,21", "20,21", "21,21"])

    game.step(A_GENERATION)

    expect(living(game)).toEqual(["20,20", "20,21", "20,22"])
  })

  test("a cell dies of crowding, and says nothing about its neighbours", () => {
    const game = createGame(
      createGameOfLife({
        patterns: [
          [
            [10, 10],
            [10, 11],
            [10, 12],
            [11, 10],
            [11, 11],
            [11, 12],
          ],
        ],
        fps: EVERY_FRAME,
      }),
    )

    game.step(A_GENERATION)

    expect(living(game)).toEqual([
      "10,10",
      "10,12",
      "11,10",
      "11,12",
      "12,11",
      "9,11",
    ])
  })

  test("a cell is born where three cells meet", () => {
    const game = createGame(
      createGameOfLife({
        patterns: [
          [
            [10, 10],
            [10, 11],
            [11, 10],
          ],
        ],
        fps: EVERY_FRAME,
      }),
    )

    game.step(A_GENERATION)

    expect(living(game)).toEqual(["10,10", "10,11", "11,10", "11,11"])
  })

  test("a glider walks one square across and one square down", () => {
    const game = createGame(
      createGameOfLife({
        patterns: [
          [
            [30, 51],
            [31, 52],
            [32, 50],
            [32, 51],
            [32, 52],
          ],
        ],
        fps: EVERY_FRAME,
      }),
    )

    game.step(A_GLIDER_JOURNEY * A_GENERATION)

    expect(living(game)).toHaveLength(5)
    expect(living(game)).not.toContain("30,51")
  })

  test("the world counts the far side of the board as next door", () => {
    const game = createGame(
      createGameOfLife({ patterns: ACROSS_THE_EDGE, fps: EVERY_FRAME }),
    )

    game.step(A_GENERATION)

    expect(living(game)).toEqual([])
  })

  test("a blinker comes back to being a row after two generations", () => {
    const game = createGame(
      createGameOfLife({
        patterns: [
          [
            [20, 20],
            [20, 21],
            [20, 22],
          ],
        ],
        fps: EVERY_FRAME,
      }),
    )

    game.step(A_BLINKER_CYCLE * A_GENERATION)

    expect(living(game)).toEqual(["20,20", "20,21", "20,22"])
  })

  test("the three patterns the game starts with do not fight each other", () => {
    const game = createGame(createGameOfLife({ fps: EVERY_FRAME }))

    game.step(20 * A_GENERATION)

    expect(cellsAt(game, ["14,30", "14,31", "15,30", "15,31"])).toEqual([
      "14,30",
      "14,31",
      "15,30",
      "15,31",
    ])
  })
})

/** Every living cell, as `row,column`, in the order the board holds them. */
function living(game) {
  return cells(game)
    .map(({ row, column }) => `${row},${column}`)
    .toSorted()
}

test("the board turns at its own rate rather than at the loop's", () => {
  const game = createGame(createGameOfLife({ patterns: [[[10, 10]]] }))

  game.step(FRAMES_SHORT_OF_A_TENTH)
  expect(cells(game)).toHaveLength(1)

  game.step(FRAMES_A_TENTH - FRAMES_SHORT_OF_A_TENTH)
  expect(cells(game)).toHaveLength(0)
})

/** Every living cell in the world. */
function cells(game) {
  return Object.values(game.state()).filter((entity) => entity.type === "Cell")
}

/** The cells that are left, told apart from the ones that were expected. */
function cellsAt(game, expected) {
  const living = new Set(
    cells(game).map(({ row, column }) => `${row},${column}`),
  )
  return expected.filter((cell) => living.has(cell))
}
