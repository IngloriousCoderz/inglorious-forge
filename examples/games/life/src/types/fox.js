import { renderCircle } from "@inglorious/renderer-2d/shapes/circle"

import { aged } from "../behaviors/aged.js"
import { breeds } from "../behaviors/breeds.js"
import { dies } from "../behaviors/dies.js"
import { eats } from "../behaviors/eats.js"
import { movesOnGrid } from "../behaviors/moves-on-grid.js"
import { CELL_SIZE, FOX_COLOR, TWO } from "../constants.js"

export function createFox(grid) {
  return [
    {
      render(entity, ctx) {
        renderCircle(
          {
            radius: CELL_SIZE / TWO,
            color: "transparent",
            backgroundColor: FOX_COLOR,
            ...entity,
          },
          ctx,
        )
      },
    },
    dies(grid),
    aged(),
    eats(grid),
    movesOnGrid(grid),
    breeds(grid),
  ]
}

export default createFox
