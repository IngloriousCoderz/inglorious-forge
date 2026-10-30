import { createGame } from "@inglorious/engine/test"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { createFoxesAndRabbits } from "../src/foxes-and-rabbits/index.js"

const A_FRAME = 1

const EVERY_FRAME = Infinity
const A_ROW = 10
const A_COLUMN = 10
const A_NEARBY_ROW = 10
const A_NEARBY_COLUMN = 11

const THE_FIRST_SQUARE = [9, 9]

describe("Foxes and rabbits", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("a fox eats a rabbit next to it and gets stronger for it", () => {
    const game = startWith([
      ["Fox", A_ROW, A_COLUMN],
      ["Rabbit", A_NEARBY_ROW, A_NEARBY_COLUMN],
    ])

    game.step(A_FRAME)

    const fox = only(game, "Fox")
    expect(fox.energy).toBe(5)
    expect(fox.age).toBe(1)
  })

  test("the rabbit that was eaten goes", () => {
    const game = startWith([
      ["Fox", A_ROW, A_COLUMN],
      ["Rabbit", A_NEARBY_ROW, A_NEARBY_COLUMN],
    ])

    game.step(2 * A_FRAME)

    expect(animals(game)).toHaveLength(1)
    expect(animals(game, "Rabbit")).toHaveLength(0)
  })

  test("a rabbit out of reach is left alone", () => {
    const game = startWith([
      ["Fox", A_ROW, A_COLUMN],
      ["Rabbit", 70, 100],
    ])

    game.step(2 * A_FRAME)

    expect(animals(game, "Rabbit")).toHaveLength(1)
    expect(only(game, "Fox").energy).toBe(0)
  })

  test("a fox with no energy left dies", () => {
    const game = startWith([["Fox", A_ROW, A_COLUMN]])

    game.step(3 * A_FRAME)

    expect(animals(game)).toHaveLength(0)
  })

  test("an animal moves to a neighbouring square", () => {
    const game = startWith([["Rabbit", A_ROW, A_COLUMN]])

    game.step(A_FRAME)

    const rabbit = only(game, "Rabbit")
    expect([rabbit.row, rabbit.column]).toEqual(THE_FIRST_SQUARE)
  })

  test("an animal leaves the square it was on", () => {
    const game = startWith([["Rabbit", A_ROW, A_COLUMN]])

    game.step(A_FRAME)

    expect(occupied(game, A_ROW, A_COLUMN)).toBe(false)
    expect(occupied(game, THE_FIRST_SQUARE[0], THE_FIRST_SQUARE[1])).toBe(true)
  })

  test("an animal too young to breed does not", () => {
    const game = startWith([["Rabbit", A_ROW, A_COLUMN]])

    game.step(4 * A_FRAME)

    expect(animals(game, "Rabbit")).toHaveLength(1)
  })

  test("an animal old enough to breed does", () => {
    const game = startWith([["Rabbit", A_ROW, A_COLUMN]])

    game.step(5 * A_FRAME)

    expect(animals(game, "Rabbit")).toHaveLength(2)
  })

  test("no two animals ever stand on the same square", () => {
    const game = startWith(
      Array.from({ length: 30 }, (_, i) => ["Rabbit", 10 + i, 10 + i]),
    )

    game.step(20 * A_FRAME)

    const squares = animals(game).map(({ row, column }) => `${row},${column}`)
    expect(new Set(squares).size).toBe(squares.length)
  })
})

/** A game with the given animals on an otherwise empty board. */
function startWith(animals) {
  return createGame(createFoxesAndRabbits({ animals, fps: EVERY_FRAME }))
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
