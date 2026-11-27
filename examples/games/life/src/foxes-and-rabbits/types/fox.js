import { renderCircle } from "@inglorious/renderer-2d/shapes/circle"

import { CELL_SIZE } from "@/constants.js"
import { aged } from "@/foxes-and-rabbits/behaviors/aged.js"
import { breeds } from "@/foxes-and-rabbits/behaviors/breeds.js"
import { dies } from "@/foxes-and-rabbits/behaviors/dies.js"
import { eats } from "@/foxes-and-rabbits/behaviors/eats.js"
import { movesOnGrid } from "@/foxes-and-rabbits/behaviors/moves-on-grid.js"
import { FOX_COLOR } from "@/foxes-and-rabbits/constants.js"

/**
 * @param {Object} grid - The board the animals stand on.
 * @param {Object} rules - The numbers this world is living by.
 */
export function createFox(grid, rules) {
  return [
    {
      render(entity, ctx) {
        renderCircle(
          {
            radius: CELL_SIZE / 2,
            color: "transparent",
            backgroundColor: FOX_COLOR,
            ...entity,
          },
          ctx,
        )
      },
    },
    dies(grid),
    aged(rules),
    eats(grid, rules),
    movesOnGrid(grid),
    breeds(grid, rules),
  ]
}

export default createFox
