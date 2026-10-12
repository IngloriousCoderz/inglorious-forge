import { atFps } from "@inglorious/engine/behaviors/at-fps.js"
import { renderCircle } from "@inglorious/renderer-2d/shapes/circle"

import { CELL_SIZE, FPS } from "../../constants.js"
import { aged } from "../behaviors/aged.js"
import { breeds } from "../behaviors/breeds.js"
import { dies } from "../behaviors/dies.js"
import { eats } from "../behaviors/eats.js"
import { movesOnGrid } from "../behaviors/moves-on-grid.js"
import { FOX_COLOR } from "../constants.js"

/**
 * @param {Object} grid - The board the animals stand on.
 * @param {Object} rules - The numbers this world is living by.
 * @param {Object} [rate] - How fast a fox lives.
 * @param {number} [rate.fps] - Turns a second. `Infinity` for one every frame.
 */
export function createFox(grid, rules, { fps = FPS } = {}) {
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

    // Last, so that it holds the whole of the above back: a fox eats, ages and breeds
    // at the world's rate rather than once for every frame the browser manages.
    atFps(fps),
  ]
}

export default createFox
