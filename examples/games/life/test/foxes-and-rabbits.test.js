import { createGame } from "@inglorious/engine/test"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { createFoxesAndRabbits } from "../src/foxes-and-rabbits/index.js"

const A_FRAME = 1
const A_ROW = 10
const A_COLUMN = 10
const A_NEARBY_ROW = 10
const A_NEARBY_COLUMN = 11

// The first square a board looks at when it is asked where an animal could go: the one up
// and to the left. Every move in this file is that one, because the dice never vary.
const THE_FIRST_SQUARE = [9, 9]

describe("Foxes and rabbits", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("a fox eats a rabbit next to it and gets stronger for it", () => {
    // given a fox next to a rabbit
    const game = startWith([
      ["Fox", A_ROW, A_COLUMN],
      ["Rabbit", A_NEARBY_ROW, A_NEARBY_COLUMN],
    ])

    // when a frame passes
    game.step(A_FRAME)

    // then the fox has lost an ounce of energy to the day and gained four to the meal,
    // which is the two it started with, less its decay, plus what eating is worth
    const fox = only(game, "Fox")
    expect(fox.energy).toBe(5)
    expect(fox.age).toBe(1)
  })

  test("the rabbit that was eaten goes", () => {
    // given a fox next to a rabbit
    const game = startWith([
      ["Fox", A_ROW, A_COLUMN],
      ["Rabbit", A_NEARBY_ROW, A_NEARBY_COLUMN],
    ])

    // when the meal is digested
    game.step(2 * A_FRAME)

    // then the rabbit is no longer on the board
    expect(animals(game)).toHaveLength(1)
    expect(animals(game, "Rabbit")).toHaveLength(0)
  })

  test("a rabbit out of reach is left alone", () => {
    // given a rabbit on the far side of the board
    const game = startWith([
      ["Fox", A_ROW, A_COLUMN],
      ["Rabbit", 70, 100],
    ])

    // when a frame passes
    game.step(2 * A_FRAME)

    // then both are still here: the fox never had a neighbour to reach for
    expect(animals(game, "Rabbit")).toHaveLength(1)
    expect(only(game, "Fox").energy).toBe(0)
  })

  test("a fox with no energy left dies", () => {
    // given a fox with nothing to eat, and two ounces of energy
    const game = startWith([["Fox", A_ROW, A_COLUMN]])

    // when three frames pass: the first takes it to one ounce, the second to none and
    // marks it for death, and the third carries the death out -- dying is decided on one
    // frame and done on the next, because nothing removes an animal on the frame it is
    // marked, only on the frame after
    game.step(3 * A_FRAME)

    // then it is gone
    expect(animals(game)).toHaveLength(0)
  })

  test("an animal moves to a neighbouring square", () => {
    // given a rabbit on an empty board
    const game = startWith([["Rabbit", A_ROW, A_COLUMN]])

    // when a frame passes
    game.step(A_FRAME)

    // then it has stepped onto one of its neighbours, and the board agrees with it
    const rabbit = only(game, "Rabbit")
    expect([rabbit.row, rabbit.column]).toEqual(THE_FIRST_SQUARE)
  })

  test("an animal leaves the square it was on", () => {
    // given a rabbit
    const game = startWith([["Rabbit", A_ROW, A_COLUMN]])

    // when it moves
    game.step(A_FRAME)

    // then its old square is free for something else to stand on
    expect(occupied(game, A_ROW, A_COLUMN)).toBe(false)
    expect(occupied(game, THE_FIRST_SQUARE[0], THE_FIRST_SQUARE[1])).toBe(true)
  })

  test("an animal too young to breed does not", () => {
    // given a rabbit that has not lived long enough
    const game = startWith([["Rabbit", A_ROW, A_COLUMN]])

    // when four frames pass, one short of breeding age
    game.step(4 * A_FRAME)

    // then it is still on its own
    expect(animals(game, "Rabbit")).toHaveLength(1)
  })

  test("an animal old enough to breed does", () => {
    // given the same rabbit, five frames later
    const game = startWith([["Rabbit", A_ROW, A_COLUMN]])

    // when it reaches breeding age and the dice come up right
    game.step(5 * A_FRAME)

    // then there are two of it
    expect(animals(game, "Rabbit")).toHaveLength(2)
  })

  test("no two animals ever stand on the same square", () => {
    // given a crowded board
    const game = startWith(
      Array.from({ length: 30 }, (_, i) => ["Rabbit", 10 + i, 10 + i]),
    )

    // when the board churns for a good while
    game.step(20 * A_FRAME)

    // then every animal still has a square of its own
    const squares = animals(game).map(({ row, column }) => `${row},${column}`)
    expect(new Set(squares).size).toBe(squares.length)
  })
})

/** A game with the given animals on an otherwise empty board. */
function startWith(animals) {
  return createGame(createFoxesAndRabbits({ animals }))
}

/** Every animal in the world, of one kind if asked. */
function animals(game, type) {
  const living = Object.values(game.state()).filter((entity) =>
    ["Fox", "Rabbit"].includes(entity.type),
  )

  return type ? living.filter((animal) => animal.type === type) : living
}

/** The one animal of a kind there is, for tests that will not do without it. */
function only(game, type) {
  const [animal] = animals(game, type)

  if (!animal) {
    throw new Error(`no ${type} is left`)
  }

  return animal
}

/** Whether anything is standing on a square, whether the store agrees or not. */
function occupied(game, row, column) {
  return animals(game).some(
    (animal) => animal.row === row && animal.column === column,
  )
}
