import { BALL_SIZE, PADDLE_HEIGHT, PADDLE_WIDTH } from "./constants.js"

// Every sprite is cut from the same sheet on its own 32x16 grid, and `renderImage`
// reads `sx`/`sy` as tile indices on it, so a frame is written in the sheet's pixels
// and divided down here. `frameSize` then says how much of the sheet to actually take,
// which is what lets a frame cross a cell boundary or sit at a size the grid does not
// describe — both of which the paddle and the ball need.
const TILE = [32, 16]

const frame = (x, y, width, height) => ({
  sx: x / TILE[0],
  sy: y / TILE[1],
  tileSize: TILE,
  frameSize: [width, height],
  imageSize: [width, height],
})

/**
 * `breakout.png` is one atlas that every sprite in the game is cropped from.
 *
 * The paddle bands are two rows deep, four colours down the sheet: blue on row 4,
 * green on 6, red on 8 and purple on 10. Within a band the four widths sit flush
 * against each other, so the 64 wide paddle starts one whole 32 wide paddle in, at
 * pixel (32, 64).
 */
export const paddleFrame = () => frame(32, 64, PADDLE_WIDTH, PADDLE_HEIGHT)

/**
 * The balls are 8x8 and sit in rows starting at (96, 48), so they are a third of a cell
 * wide. The original serves the first of them: its quad table starts at one, so the
 * skin it asks for by name is the one at x 96 rather than the one after it.
 */
export const ballFrame = () => frame(96, 48, BALL_SIZE, BALL_SIZE)
