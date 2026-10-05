import {
  BALL_SIZE,
  BRICK_HEIGHT,
  BRICK_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from "./constants.js"

// Every sprite is cut from the same sheet on its own 32x16 grid. A frame says where it
// is on the sheet and how much of it to take, in pixels, and `crop` divides that down to
// the grid for the renderer.
const TILE = [32, 16]

/**
 * `breakout.png` is one atlas that every sprite in the game is cropped from.
 *
 * The paddle bands are two rows deep, four colours down the sheet: blue on row 4,
 * green on 6, red on 8 and purple on 10. Within a band the four widths sit flush
 * against each other, so the 64 wide paddle starts one whole 32 wide paddle in, at
 * pixel (32, 64).
 */
export const paddleFrame = () => ({
  x: 32,
  y: 64,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  tileSize: TILE,
})

/**
 * The balls are 8x8 and sit in rows starting at (96, 48), so they are a third of a cell
 * wide. The original serves the first of them: its quad table starts at one, so the skin
 * it asks for by name is the one at x 96 rather than the one after it.
 */
export const ballFrame = () => ({
  x: 96,
  y: 48,
  width: BALL_SIZE,
  height: BALL_SIZE,
  tileSize: TILE,
})

/**
 * The bricks are just the first tiles of the sheet in order, and the original only ever
 * draws the first one, because the tiers and colours that would pick a later tile arrive
 * with the levels that use them.
 */
export const brickFrame = () => ({
  x: 0,
  y: 0,
  width: BRICK_WIDTH,
  height: BRICK_HEIGHT,
  tileSize: TILE,
})
