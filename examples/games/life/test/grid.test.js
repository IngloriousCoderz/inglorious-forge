import { describe, expect, test } from "vitest"

import { BOARD_COLUMNS, BOARD_ROWS } from "../src/constants.js"
import { createGrid, place, toPosition } from "../src/grid.js"

const A_ROW = 10
const A_COLUMN = 10
const A_LAST_ROW = 79
const A_LAST_COLUMN = 119

describe("the board", () => {
  test("a square something has been put on is occupied, and holds what was put there", () => {
    const grid = createGrid()
    grid.occupy(A_ROW, A_COLUMN, "rabbit-1")

    expect(grid.isOccupied(A_ROW, A_COLUMN)).toBe(true)
    expect(grid.getEntityIdAt(A_ROW, A_COLUMN)).toBe("rabbit-1")
  })

  test("an empty square is free, and says what is not there", () => {
    const grid = createGrid()

    expect(grid.isOccupied(A_ROW, A_COLUMN)).toBe(false)
    expect(grid.getEntityIdAt(A_ROW, A_COLUMN)).toBeNull()
  })

  test("two things cannot stand on the same square", () => {
    const grid = createGrid()
    grid.occupy(A_ROW, A_COLUMN, "rabbit-1")

    const wasTaken = grid.occupy(A_ROW, A_COLUMN, "fox-2")

    expect(wasTaken).toBe(false)
    expect(grid.getEntityIdAt(A_ROW, A_COLUMN)).toBe("rabbit-1")
  })

  test("nothing can stand off the edge of the board", () => {
    const grid = createGrid()

    const placed = [
      grid.occupy(-1, A_COLUMN, "above"),
      grid.occupy(A_ROW, A_LAST_COLUMN + 1, "beside"),
      grid.occupy(A_LAST_ROW + 1, A_COLUMN, "below"),
    ]

    expect(placed).toEqual([false, false, false])
  })

  test("vacating a square frees it", () => {
    const grid = createGrid()
    grid.occupy(A_ROW, A_COLUMN, "rabbit-1")

    grid.vacate(A_ROW, A_COLUMN)

    expect(grid.isOccupied(A_ROW, A_COLUMN)).toBe(false)
  })

  test("vacating a square that is empty is not an error", () => {
    const grid = createGrid()

    expect(() => grid.vacate(A_ROW, A_COLUMN)).not.toThrow()
  })

  test("a square counts how many things are beside it", () => {
    const grid = createGrid()
    grid.occupy(A_ROW - 1, A_COLUMN - 1, "1")
    grid.occupy(A_ROW, A_COLUMN - 1, "2")
    grid.occupy(A_ROW + 1, A_COLUMN + 1, "3")
    grid.occupy(A_ROW + 5, A_COLUMN + 5, "far")

    expect(grid.countOccupiedNeighbors(A_ROW, A_COLUMN)).toBe(3)
  })

  test("a square on a board that does not wrap has no neighbours past the edge", () => {
    const grid = createGrid()
    grid.occupy(A_LAST_ROW, A_LAST_COLUMN, "corner")

    expect(grid.countOccupiedNeighbors(0, 0)).toBe(0)
  })

  test("a board that wraps counts the far side as next door", () => {
    const grid = createGrid({ wrap: "both" })
    grid.occupy(A_LAST_ROW, A_LAST_COLUMN, "corner")

    expect(grid.countOccupiedNeighbors(0, 0)).toBe(1)
  })

  test("a board knows when it has no room left", () => {
    const grid = createGrid()
    fill(grid)

    expect(grid.isFull()).toBe(true)

    grid.vacate(0, 0)

    expect(grid.isFull()).toBe(false)
  })

  test("a full board takes nothing more", () => {
    const grid = createGrid()
    fill(grid)

    expect(grid.occupy(0, 0, "one-too-many")).toBe(false)
  })

  test("resetting puts back only what it was given", () => {
    const grid = createGrid()
    grid.occupy(A_ROW, A_COLUMN, "stranger")

    grid.reset({
      "rabbit-1": { type: "Rabbit", row: 0, column: 0 },
      "fox-2": { type: "Fox", row: 0, column: 1 },
    })

    expect(grid.isOccupied(A_ROW, A_COLUMN)).toBe(false)
    expect(grid.getEntityIdAt(0, 0)).toBe("rabbit-1")
    expect(grid.getEntityIdAt(0, 1)).toBe("fox-2")
  })

  test("placing something puts it on the square it was asked for", () => {
    const grid = createGrid()

    const rabbit = place(grid, "Rabbit", A_ROW, A_COLUMN)

    expect([rabbit.row, rabbit.column]).toEqual([A_ROW, A_COLUMN])
    expect(grid.getEntityIdAt(A_ROW, A_COLUMN)).toBe(rabbit.id)
    expect(rabbit.position).toEqual(toPosition(A_ROW, A_COLUMN))
  })

  test("placing something on a taken square gets nothing", () => {
    const grid = createGrid()
    place(grid, "Rabbit", A_ROW, A_COLUMN)

    const fox = place(grid, "Fox", A_ROW, A_COLUMN)

    expect(fox).toBeUndefined()
  })
})

/** A board with something standing on every one of its squares. */
function fill(grid) {
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let column = 0; column < BOARD_COLUMNS; column += 1) {
      grid.occupy(row, column, `animal-${row}-${column}`)
    }
  }
}
