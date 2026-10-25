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
export function createGameOfLife({ patterns = PATTERNS, fps } = {}) {
  const grid = createGrid({ wrap: WRAPS })

  return createLifeGame({
    fps,
    systems: [generations(grid)],

    types: {
      Cell: createCell(),
      Board: [restarting(grid, patterns)],
    },

    entities: seed(grid, patterns),

    readout: (entities) => {
      // Nothing until the first generation has been counted.
      const { generation = 0 } = entities.board
      return `Generation ${generation} - ${countCells(entities)} cells`
    },
  })
}

/** Puts the starting cells on the board, skipping any square already taken. */
function seed(grid, patterns) {
  const cells = {}

  for (const pattern of patterns) {
    for (const [row, column] of pattern) {
      const cell = place(grid, "Cell", row, column)

      if (cell) {
        cells[cell.id] = cell
      }
    }
  }

  return cells
}

/**
 * Puts the board back to how it started.
 *
 * The squares are freed before the new cells are put down, because a square will not
 * take a cell while it still holds the old one -- which is the same rule that made a
 * dying animal vacate before its successor arrived.
 */
function restarting(grid, patterns) {
  return {
    reset(board, event, api) {
      for (const [id, cell] of Object.entries(api.getEntities())) {
        if (cell.type !== "Cell") continue

        grid.vacate(cell.row, cell.column)
        api.notify("remove", id)
      }

      for (const cell of Object.values(seed(grid, patterns))) {
        api.notify("add", cell)
      }

      board.generation = 0
    },
  }
}

/** How many cells are alive. */
function countCells(entities) {
  return Object.values(entities).filter((entity) => entity.type === "Cell")
    .length
}
