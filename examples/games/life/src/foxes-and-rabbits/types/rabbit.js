import { atFps } from "@inglorious/engine/behaviors/at-fps.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle"

import { CELL_SIZE, FPS } from "../../constants.js"
import { aged } from "../behaviors/aged.js"
import { breeds } from "../behaviors/breeds.js"
import { dies } from "../behaviors/dies.js"
import { movesOnGrid } from "../behaviors/moves-on-grid.js"
import { RABBIT_COLOR } from "../constants.js"

/**
 * @param {Object} grid - The board the animals stand on.
 * @param {Object} rules - The numbers this world is living by.
 * @param {Object} [rate] - How fast a rabbit lives.
 * @param {number} [rate.fps] - Turns a second. `Infinity` for one every frame.
 */
export function createRabbit(grid, rules, { fps = FPS } = {}) {
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

    // Last, so that it holds the whole of the above back: a rabbit ages and breeds at
    // the world's rate rather than once for every frame the browser manages.
    atFps(fps),
  ]
}

export default createRabbit
