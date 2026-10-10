import { createLifeGame } from "../game.js"
import { createGrid, place } from "../grid.js"
import { WRAPS } from "./constants.js"
import { generations } from "./systems/generations.js"
import { createCell } from "./types/cell.js"

/**
 * Three patterns that between them show most of what Conway's rules do: the blinker
 * never changes shape, the block is unchanging, and the glider walks away across the
 * board forever.
 */
const PATTERNS = [
  // A blinker: three in a row, which flips between that and a column.
  [
    [10, 10],
    [10, 11],
    [10, 12],
  ],
  // A block: four that hold still forever.
  [
    [14, 30],
    [14, 31],
    [15, 30],
    [15, 31],
  ],
  // A glider: five that walk one square across and one square down every four
  // generations, and come back round on the far side of the board.
  [
    [20, 50],
    [21, 51],
    [22, 50],
    [22, 51],
    [22, 52],
  ],
]

/**
 * Conway's Game of Life.
 *
 * Nothing here decides what happens to a cell. A generation runs on the board as a whole
 * and every cell's fate is settled at the same moment, which is the one thing this world
 * needs that foxes and rabbits never do.
 *
 * A Conway world is its rules plus where the cells start, so the starting cells are an
 * argument rather than a fixed arrangement: that is what lets the same world be set up
 * with one pattern on it while being worked out, and with three on it to be looked at.
 */
export function createGameOfLife({ patterns = PATTERNS } = {}) {
  const grid = createGrid({ wrap: WRAPS })
  const cells = {}

  for (const pattern of patterns) {
    for (const [row, column] of pattern) {
      const cell = placeCell(grid, row, column)

      if (cell) {
        cells[cell.id] = cell
      }
    }
  }

  return createLifeGame({
    systems: [generations(grid)],

    types: {
      Cell: createCell(),
    },

    entities: cells,
  })
}

/** Puts a cell on the board at a square, if that square will take it. */
export function placeCell(grid, row, column) {
  return place(grid, "Cell", row, column)
}
