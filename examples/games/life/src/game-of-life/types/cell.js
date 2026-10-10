import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle"

import { CELL_SIZE } from "../../constants.js"
import { CELL_COLOR } from "../constants.js"

/**
 * A cell is only a thing that can be drawn: what a cell does is decided by the board
 * rather than by the cell, which is why there is no behaviour on it at all.
 */
export function createCell() {
  return [
    {
      render(entity, ctx) {
        renderRectangle(
          {
            size: [CELL_SIZE, 0, CELL_SIZE],
            color: "transparent",
            backgroundColor: CELL_COLOR,
            ...entity,
          },
          ctx,
        )
      },
    },
  ]
}
