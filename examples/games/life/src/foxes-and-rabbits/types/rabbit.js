import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle"

import { CELL_SIZE } from "../../constants.js"
import { aged } from "../behaviors/aged.js"
import { breeds } from "../behaviors/breeds.js"
import { dies } from "../behaviors/dies.js"
import { movesOnGrid } from "../behaviors/moves-on-grid.js"
import { RABBIT_COLOR } from "../constants.js"

/**
 * @param {Object} grid - The board the animals stand on.
 * @param {Object} rules - The numbers this world is living by.
 */
export function createRabbit(grid, rules) {
  return [
    {
      eaten(entity, preyId) {
        if (entity.id === preyId) {
          entity.isDying = true
        }
      },

      render(entity, ctx) {
        renderRectangle(
          {
            size: [CELL_SIZE, 0, CELL_SIZE],
            color: "transparent",
            backgroundColor: RABBIT_COLOR,
            ...entity,
          },
          ctx,
        )
      },
    },
    dies(grid),
    aged(rules),
    movesOnGrid(grid),
    breeds(grid, rules),
  ]
}

export default createRabbit
