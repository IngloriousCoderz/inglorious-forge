import { describe, expect, test } from "vitest"

import { BOARD_COLUMNS, BOARD_ROWS } from "../src/constants.js"
import { createGrid, place, toPosition } from "../src/grid.js"

const A_ROW = 10
const A_COLUMN = 10
const A_LAST_ROW = 79
const A_LAST_COLUMN = 119

describe("the board", () => {
  test("a square something has been put on is occupied, and holds what was put there", () => {
    // given a board with something on it
    const grid = createGrid()
    grid.occupy(A_ROW, A_COLUMN, "rabbit-1")

    // then that square is occupied and the board knows what is standing there
    expect(grid.isOccupied(A_ROW, A_COLUMN)).toBe(true)
    expect(grid.getEntityIdAt(A_ROW, A_COLUMN)).toBe("rabbit-1")
  })

  test("an empty square is free, and says what is not there", () => {
    const grid = createGrid()

    expect(grid.isOccupied(A_ROW, A_COLUMN)).toBe(false)
    expect(grid.getEntityIdAt(A_ROW, A_COLUMN)).toBeNull()
  })

  test("two things cannot stand on the same square", () => {
    // given a square that is already taken
    const grid = createGrid()
    grid.occupy(A_ROW, A_COLUMN, "rabbit-1")

    // when something else is put on it
    const wasTaken = grid.occupy(A_ROW, A_COLUMN, "fox-2")

    // then it is refused, and the square still holds what was there first
    expect(wasTaken).toBe(false)
    expect(grid.getEntityIdAt(A_ROW, A_COLUMN)).toBe("rabbit-1")
  })

  test("nothing can stand off the edge of the board", () => {
    // given a board
    const grid = createGrid()

    // when things are put past its edges and corners
    const placed = [
      grid.occupy(-1, A_COLUMN, "above"),
      grid.occupy(A_ROW, A_LAST_COLUMN + 1, "beside"),
      grid.occupy(A_LAST_ROW + 1, A_COLUMN, "below"),
    ]

    // then all of them are refused
    expect(placed).toEqual([false, false, false])
  })

  test("vacating a square frees it", () => {
    // given a board with something on it
    const grid = createGrid()
    grid.occupy(A_ROW, A_COLUMN, "rabbit-1")

    // when it leaves
    grid.vacate(A_ROW, A_COLUMN)

    // then the square is free again
    expect(grid.isOccupied(A_ROW, A_COLUMN)).toBe(false)
  })

  test("vacating a square that is empty is not an error", () => {
    const grid = createGrid()

    expect(() => grid.vacate(A_ROW, A_COLUMN)).not.toThrow()
  })

  test("a square counts how many things are beside it", () => {
    // given a board with three neighbours and one further away
    const grid = createGrid()
    grid.occupy(A_ROW - 1, A_COLUMN - 1, "1")
    grid.occupy(A_ROW, A_COLUMN - 1, "2")
    grid.occupy(A_ROW + 1, A_COLUMN + 1, "3")
    grid.occupy(A_ROW + 5, A_COLUMN + 5, "far")

    // then only the three that touch are counted
    expect(grid.countOccupiedNeighbors(A_ROW, A_COLUMN)).toBe(3)
  })

  test("a square on a board that does not wrap has no neighbours past the edge", () => {
    // given something in the far corner
    const grid = createGrid()
    grid.occupy(A_LAST_ROW, A_LAST_COLUMN, "corner")

    // then the corner beside it on a solid board has nothing around it
    expect(grid.countOccupiedNeighbors(0, 0)).toBe(0)
  })

  test("a board that wraps counts the far side as next door", () => {
    // given something in the far corner, and a board that wraps
    const grid = createGrid({ wrap: "both" })
    grid.occupy(A_LAST_ROW, A_LAST_COLUMN, "corner")

    // then the opposite corner is its neighbour
    expect(grid.countOccupiedNeighbors(0, 0)).toBe(1)
  })

  test("a board knows when it has no room left", () => {
    // given a board filled to its last square
    const grid = createGrid()
    fill(grid)

    // then it is full
    expect(grid.isFull()).toBe(true)

    // and when one thing comes off, there is room again -- which is the part a board
    // gets wrong when it counts what was put on it but forgets what came off, and the
    // only way to see that is to fill the board rather than to reason about it
    grid.vacate(0, 0)

    expect(grid.isFull()).toBe(false)
  })

  test("a full board takes nothing more", () => {
    // given a board filled to its last square
    const grid = createGrid()
    fill(grid)

    // then there is nowhere left to put anything
    expect(grid.occupy(0, 0, "one-too-many")).toBe(false)
  })

  test("resetting puts back only what it was given", () => {
    // given a board with something on it that reset was not told about
    const grid = createGrid()
    grid.occupy(A_ROW, A_COLUMN, "stranger")

    // when it is reset with a different animal
    grid.reset({
      "rabbit-1": { type: "Rabbit", row: 0, column: 0 },
      "fox-2": { type: "Fox", row: 0, column: 1 },
    })

    // then the stranger is gone and the two it was told about are there
    expect(grid.isOccupied(A_ROW, A_COLUMN)).toBe(false)
    expect(grid.getEntityIdAt(0, 0)).toBe("rabbit-1")
    expect(grid.getEntityIdAt(0, 1)).toBe("fox-2")
  })

  test("placing something puts it on the square it was asked for", () => {
    // given a board
    const grid = createGrid()

    // when something is placed
    const rabbit = place(grid, "Rabbit", A_ROW, A_COLUMN)

    // then it is on that square, where the board can see it, and standing where the
    // board says that square is on screen
    expect([rabbit.row, rabbit.column]).toEqual([A_ROW, A_COLUMN])
    expect(grid.getEntityIdAt(A_ROW, A_COLUMN)).toBe(rabbit.id)
    expect(rabbit.position).toEqual(toPosition(A_ROW, A_COLUMN))
  })

  test("placing something on a taken square gets nothing", () => {
    // given a square that is already taken
    const grid = createGrid()
    place(grid, "Rabbit", A_ROW, A_COLUMN)

    // when something else is placed there
    const fox = place(grid, "Fox", A_ROW, A_COLUMN)

    // then there is nothing to place
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
