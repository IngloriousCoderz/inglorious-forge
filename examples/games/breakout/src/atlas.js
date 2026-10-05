import { PADDLE_HEIGHT, PADDLE_WIDTH } from "./constants.js"

/**
 * `breakout.png` is one atlas that every sprite in the game is cropped from.
 *
 * The paddle bands are two rows deep, four colours down the sheet: blue on row 4,
 * green on 6, red on 8 and purple on 10. Within a band the four widths sit flush
 * against each other, so the 64 wide paddle starts one whole 32 wide paddle in, at
 * pixel (32, 64).
 *
 * `renderImage` reads `sx`/`sy` as tile indices on `tileSize`, so they are given in
 * pixels here and scaled down to the sheet's 32x16 grid. The 64 wide paddle is wider
 * than one cell, so it also covers the cell after it, which is what `frameSize` is
 * for: without it the renderer only ever reads one whole tile.
 */
export function paddleFrame() {
  return {
    sx: 32 / 32,
    sy: 64 / 16,
    tileSize: [32, 16],
    frameSize: [PADDLE_WIDTH, PADDLE_HEIGHT],
    imageSize: [PADDLE_WIDTH, PADDLE_HEIGHT],
  }
}
