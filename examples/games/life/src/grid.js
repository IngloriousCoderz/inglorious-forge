import { v } from "@inglorious/utils"
import {
  countNeighbors,
  getIndex,
} from "@inglorious/utils/data-structures/board"

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  BOARD_X,
  BOARD_Z,
  CELL_SIZE,
  EMPTY,
} from "./constants.js"

let nextId = 0
const MAX_POPULATION = BOARD_ROWS * BOARD_COLUMNS
const NO_WRAP = undefined

/**
 * A fixed board that remembers what stands where.
 *
 * The board is what both worlds have in common, so it knows nothing about foxes or
 * rabbits or cells: it knows which square is taken and how full it is, and leaves what
 * stands there to the game.
 */
export function createGrid({ wrap = NO_WRAP } = {}) {
  const entityAt = new Array(MAX_POPULATION).fill(EMPTY)
  let population = 0

  function indexOf(row, column) {
    return getIndex(row, column, BOARD_COLUMNS)
  }

  function isInside(row, column) {
    return row >= 0 && row < BOARD_ROWS && column >= 0 && column < BOARD_COLUMNS
  }

  function isOccupied(row, column) {
    return isInside(row, column) && entityAt[indexOf(row, column)] !== EMPTY
  }

  function getEntityIdAt(row, column) {
    return isInside(row, column) ? entityAt[indexOf(row, column)] : EMPTY
  }

  function occupy(row, column, id) {
    if (!isInside(row, column) || population >= MAX_POPULATION) {
      return false
    }

    const index = indexOf(row, column)

    if (entityAt[index] !== EMPTY) {
      return false
    }

    entityAt[index] = id
    population += 1
    return true
  }

  function vacate(row, column) {
    if (!isOccupied(row, column)) {
      return
    }

    entityAt[indexOf(row, column)] = EMPTY
    population -= 1
  }

  function countOccupiedNeighbors(row, column) {
    return countNeighbors(
      entityAt,
      [row, column],
      [BOARD_ROWS, BOARD_COLUMNS],
      {
        wrap,
        predicate: (cell) => cell !== EMPTY,
      },
    )
  }

  // Whether there is anywhere left to put one. It says nothing about whether any
  // particular square is free -- that is `occupy`'s business, and it answers that
  // separately, so a caller that wants to know can ask both questions.
  function isFull() {
    return population >= MAX_POPULATION
  }

  function reset(entities) {
    entityAt.fill(EMPTY)
    population = 0

    for (const id in entities) {
      const entity = entities[id]

      if (entity.row !== undefined && entity.column !== undefined) {
        entityAt[indexOf(entity.row, entity.column)] = id
        population += 1
      }
    }
  }

  return {
    isFull,
    countOccupiedNeighbors,
    getEntityIdAt,
    isOccupied,
    occupy,
    reset,
    vacate,
  }
}

export function toPosition(row, column) {
  return v(
    BOARD_X + column * CELL_SIZE + CELL_SIZE / 2,
    0,
    BOARD_Z - row * CELL_SIZE - CELL_SIZE / 2,
  )
}

/**
 * Puts something on the board at a square, if that square will take it.
 *
 * The board does not care what it is; the world that asked for it does.
 */
export function place(grid, type, row, column) {
  const id = `${type.toLowerCase()}-${nextId++}`

  if (!grid.occupy(row, column, id)) {
    return undefined
  }

  return {
    id,
    type,
    row,
    column,
    isDying: false,
    position: toPosition(row, column),
  }
}
