import { BOARD_COLUMNS, BOARD_ROWS } from "../../constants.js"
import { place } from "../../grid.js"

// A cell that is already alive stays alive on two or three neighbours, and nothing else
// comes alive except on exactly three. Those are the only two numbers in Conway's rules.
const SURVIVES_ON = [2, 3]
const IS_BORN_ON = 3

/**
 * Steps the whole board one generation at a time.
 *
 * Conway's rule cannot be written as a behaviour on a cell, because a cell is born in a
 * square that is currently empty, and an empty square has nothing in it to run a
 * behaviour. The decision has to be the board's, so it is a system: it runs once per
 * frame, after every cell has had its turn, and nobody changes anything until it has
 * decided everything.
 */
export function generations(grid) {
  return {
    update(entities, dt, api) {
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
