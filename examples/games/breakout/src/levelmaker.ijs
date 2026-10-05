import { random } from "@inglorious/utils/math/rng.js"
import { v } from "@inglorious/utils/v.js"

import {
  BRICK_HEIGHT,
  BRICK_MAX_COLS,
  BRICK_MAX_COLUMN_PADDING,
  BRICK_MAX_ROWS,
  BRICK_MIN_COLS,
  BRICK_MIN_ROWS,
  BRICK_PADDING,
  BRICK_WIDTH,
  HEIGHT,
  LEFT_EDGE,
  TOP_EDGE,
} from "./constants.js"

const FIRST_ROW = 0
const FIRST_COLUMN = 0
const FIRST_BRICK = 1
const BRICK_ID_PREFIX = "brick"

/**
 * Makes a level of bricks at random, the way `LevelMaker.createMap` does.
 *
 * The count of each is rolled separately and the bricks are laid out to touch, centred
 * by padding with half a brick's width for however many columns are missing from the
 * widest level.
 *
 * The original's rows count down from the top of the screen, which in this world means
 * counting up from the ceiling, so a row's altitude is the height less the original's y.
 */
export function createLevel(layer) {
  const rows = random(BRICK_MIN_ROWS, BRICK_MAX_ROWS)
  const columns = random(BRICK_MIN_COLS, BRICK_MAX_COLS)

  const padding =
    BRICK_PADDING + (BRICK_MAX_COLS - columns) * BRICK_MAX_COLUMN_PADDING

  const bricks = []

  for (let row = FIRST_ROW; row < rows; row++) {
    for (let column = FIRST_COLUMN; column < columns; column++) {
      const index = row * columns + column + FIRST_BRICK

      bricks.push({
        id: `${BRICK_ID_PREFIX}${index}`,
        type: "Brick",
        layer,
        position: v(
          column * BRICK_WIDTH + padding,
          HEIGHT - (row + 1) * BRICK_HEIGHT,
          0,
        ),
        anchor: [LEFT_EDGE, TOP_EDGE],
        size: v(BRICK_WIDTH, BRICK_HEIGHT, 0),
        solid: true,
      })
    }
  }

  return bricks
}
