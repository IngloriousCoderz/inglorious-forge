import { createGame } from "@inglorious/engine/test"
import { describe, expect, test } from "vitest"

import { createGameOfLife } from "../src/game-of-life/index.js"

const A_GENERATION = 1

// A blinker turns over once every two generations, so it is back where it started after
// two, and a glider walks one square across and one square down every four.
const A_BLINKER_CYCLE = 2
const A_GLIDER_JOURNEY = 4

// Conway's board wraps around, so these are the two squares the other side of the board
// that the board counts as being next door.
const ACROSS_THE_EDGE = [
  [
    [0, 0],
    [79, 119],
  ],
]

describe("Conway's Game of Life", () => {
  test("a cell on its own dies, having nothing to keep it alive", () => {
    // given one cell, alone on an empty board
    const game = createGame(createGameOfLife({ patterns: [[[10, 10]]] }))

    // when a generation passes
    game.step(A_GENERATION)

    // then it is gone, because two neighbours is the fewest a cell survives on
    expect(living(game)).toEqual([])
  })

  test("a block of four stays exactly where it is", () => {
    // given the stillest thing in Conway's
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
      }),
    )

    // when the world turns over and over
    game.step(8 * A_GENERATION)

    // then none of it died and none of it moved
    expect(living(game)).toEqual(["10,10", "10,11", "11,10", "11,11"])
  })

  test("a blinker turns over and then back again", () => {
    // given a row of three
    const game = createGame(
      createGameOfLife({
        patterns: [
          [
            [20, 20],
            [20, 21],
            [20, 22],
          ],
        ],
      }),
    )

    // when a generation passes
    game.step(A_GENERATION)

    // then it is standing on end instead, which is the same three cells the other way up
    expect(living(game)).toEqual(["19,21", "20,21", "21,21"])

    // and when another generation passes
    game.step(A_GENERATION)

    // then it is a row again
    expect(living(game)).toEqual(["20,20", "20,21", "20,22"])
  })

  test("a cell dies of crowding, and says nothing about its neighbours", () => {
    // given a rectangle of six, whose four corners have three neighbours each and whose
    // two middles have five
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
      }),
    )

    // when a generation passes
    game.step(A_GENERATION)

    // then the four corners are still there and the two middles are not, and the two
    // squares above and below the middle have filled up because three met in each
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
    // given three cells in an L, which is the one shape that always makes another
    const game = createGame(
      createGameOfLife({
        patterns: [
          [
            [10, 10],
            [10, 11],
            [11, 10],
          ],
        ],
      }),
    )

    // when a generation passes
    game.step(A_GENERATION)

    // then the corner they leave empty fills up
    expect(living(game)).toEqual(["10,10", "10,11", "11,10", "11,11"])
  })

  test("a glider walks one square across and one square down", () => {
    // given a glider
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
      }),
    )

    // when it has walked four generations
    game.step(A_GLIDER_JOURNEY * A_GENERATION)

    // then it is one across and one down, and still made of five cells
    expect(living(game)).toHaveLength(5)
    expect(living(game)).not.toContain("30,51")
  })

  test("the world counts the far side of the board as next door", () => {
    // given two cells in opposite corners, which are neighbours on a board that wraps
    const game = createGame(createGameOfLife({ patterns: ACROSS_THE_EDGE }))

    // when a generation passes
    game.step(A_GENERATION)

    // then they were each other's only neighbour, and two is not enough
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
      }),
    )

    game.step(A_BLINKER_CYCLE * A_GENERATION)

    expect(living(game)).toEqual(["20,20", "20,21", "20,22"])
  })

  test("the three patterns the game starts with do not fight each other", () => {
    // given the world as it actually ships
    const game = createGame(createGameOfLife())

    // when the world turns for a good while
    game.step(20 * A_GENERATION)

    // then the block is still exactly where it was and still whole, which it could only
    // be if nothing else had wandered over and touched it
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
