import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle"

import { aged } from "../behaviors/aged.js"
import { breeds } from "../behaviors/breeds.js"
import { dies } from "../behaviors/dies.js"
import { movesOnGrid } from "../behaviors/moves-on-grid.js"
import { CELL_SIZE, RABBIT_COLOR, ZERO } from "../constants.js"

export function createRabbit(grid) {
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
            size: [CELL_SIZE, ZERO, CELL_SIZE],
            color: "transparent",
            backgroundColor: RABBIT_COLOR,
            ...entity,
          },
          ctx,
        )
      },
    },
    dies(grid),
    aged(),
    movesOnGrid(grid),
    breeds(grid),
  ]
}

export default createRabbit
