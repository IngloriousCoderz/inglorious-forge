import {
  PADDLE_FRAME_SIZE,
  PADDLE_TILE,
  PADDLE_TILE_SIZE,
} from "./constants.js"

const [PADDLE_TILE_X, PADDLE_TILE_Y] = PADDLE_TILE

/**
 * `breakout.png` is one atlas that every sprite in the game is cropped from.
 *
 * The paddle bands are two rows deep, four colours down the sheet: blue on row 4,
 * green on 6, red on 8 and purple on 10. Within a band the four widths sit flush
 * against each other, so the 64 wide paddle starts one whole 32 wide paddle in.
 *
 * `renderImage` reads `sx`/`sy` as tile indices on `tileSize` and then always reads
 * one whole tile, so a frame wider than a cell needs `frameSize` to say how much of
 * the sheet to take. The 64 wide paddle spans two cells.
 */
export function paddleFrame() {
  return {
    sx: PADDLE_TILE_X,
    sy: PADDLE_TILE_Y,
    tileSize: PADDLE_TILE_SIZE,
    frameSize: PADDLE_FRAME_SIZE,
    imageSize: PADDLE_FRAME_SIZE,
  }
}
