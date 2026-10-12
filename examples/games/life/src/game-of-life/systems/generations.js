import { dueAt } from "@inglorious/engine/animation/due.js"

import { BOARD_COLUMNS, BOARD_ROWS, FPS } from "../../constants.js"
import { place } from "../../grid.js"

// A cell that is already alive stays alive on two or three neighbours, and nothing else
// comes alive except on exactly three. Those are the only two numbers in Conway's rules.
const SURVIVES_ON = [2, 3]
const IS_BORN_ON = 3

const ONE_SECOND = 1

/**
 * How many turns the world has taken, kept on the board that was turned.
 *
 * The board is taken from the draft rather than asked for by name: a system that writes
 * through the api is writing to a copy, and the number would go nowhere.
 */
function countGeneration(entities) {
  const board = entities.board
  board.generation = (board.generation ?? 0) + 1
}

/**
 * Steps the whole board one generation at a time.
 *
 * Conway's rule cannot be written as a behaviour on a cell, because a cell is born in a
 * square that is currently empty, and an empty square has nothing in it to run a
 * behaviour. The decision has to be the board's, so it is a system: it runs once per
 * frame, after every cell has had its turn, and nobody changes anything until it has
 * decided everything.
 *
 * The board turns at `fps` of its own rather than at the loop's, which is what an
 * entity would say with `atFps` and a system cannot: it has no entity of its own to
 * keep the time on, so it keeps it here -- and asks `dueAt` the same question, so that
 * "has a generation arrived" is written down once rather than twice.
 *
 * @param {Object} grid - The board being turned.
 * @param {Object} [rate] - How fast the board turns.
 * @param {number} [rate.fps] - Generations a second. `Infinity` for one a frame.
 */
export function generations(grid, { fps = FPS } = {}) {
  // Halting the store stops the entities updating, but systems are still asked, so a
  // generation has to hear the pause for itself. Without this the board carries on
  // turning underneath a pause that everything else is honouring.
  let halted = false
  let clock = 0

  const isDue = dueAt(ONE_SECOND / fps)

  return {
    pause() {
      halted = true
    },

    resume() {
      halted = false
    },

    update(entities, dt, api) {
      if (halted) return

      // A generation a second is ten turns a second here, whatever the browser manages
      // in between, and the board is not waiting on the pointer for any of it.
      const { since, elapsed } = isDue(clock, dt)

      clock = since

      if (elapsed === undefined) return

      countGeneration(entities)

      const born = []
      const died = []

      for (let row = 0; row < BOARD_ROWS; row += 1) {
        for (let column = 0; column < BOARD_COLUMNS; column += 1) {
          const neighbours = grid.countOccupiedNeighbors(row, column)
          const isAlive = grid.isOccupied(row, column)
          const willLive = isAlive
            ? SURVIVES_ON.includes(neighbours)
            : neighbours === IS_BORN_ON

          if (willLive === isAlive) {
            continue
          }

          if (willLive) {
            born.push([row, column])
          } else {
            died.push([row, column, grid.getEntityIdAt(row, column)])
          }
        }
      }

      // Everything is decided before anything is done. A cell that dies here frees a
      // square that another cell is born into on the very same generation, and whether
      // that works must not depend on which of them the loop happened to reach first.
      for (const [row, column, id] of died) {
        grid.vacate(row, column)
        api.notify("remove", id)
      }

      for (const [row, column] of born) {
        const cell = place(grid, "Cell", row, column)

        if (cell) {
          api.notify("add", cell)
        }
      }
    },
  }
}
