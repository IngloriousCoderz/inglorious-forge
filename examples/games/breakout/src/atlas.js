import {
  BALL_SIZE,
  BRICK_COLORS_PER_TIER,
  BRICK_FIRST_COLOR,
  BRICK_HEIGHT,
  BRICK_WIDTH,
  HEART_HEIGHT,
  HEART_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from "./constants.js"

/**
 * The grid `breakout.png` is cut on, which is the original's own `GenerateQuads(atlas,
 * 32, 16)`.
 *
 * These are named apart from a brick's own size on purpose. The two happen to be the same
 * here, so writing one in terms of the other saves a line and reads well -- until a brick
 * is resized, at which point every sprite on the sheet moves with it and nothing says why.
 * The sheet is cut a particular way; a brick is drawn a particular size; the brick is
 * padded out to fill its cell.
 *
 * A frame says where on that grid it is, in pixels, which is how the original's quad table
 * reads and so is the easier thing to check against it. `crop` divides a frame down to the
 * grid for the renderer.
 */
export const SHEET_TILE_WIDTH = 32
export const SHEET_TILE_HEIGHT = 16
export const SHEET_TILE = [SHEET_TILE_WIDTH, SHEET_TILE_HEIGHT]

// The original numbers its quads in reading order down the sheet, so the seventh is the
// first tile of the second row rather than anything further along the first. That is what
// a quad's own number has to be divided by to say where it sits.
export const SHEET_TILES_ACROSS = 6

/**
 * `breakout.png` is one atlas that every sprite in the game is cropped from.
 *
 * The paddle bands are two rows deep, four colours down the sheet: blue on row 4,
 * green on 6, red on 8 and purple on 10. Within a band the four widths sit flush
 * against each other, so the 64 wide paddle starts one whole 32 wide paddle in, at
 * pixel (32, 64).
 */
export const paddleFrame = (skin = 1) => ({
  // Always the 64 wide paddle: the sheet carries four widths, but the original picks the
  // second quad of a row, so all four of its choices are the same size in four colours.
  x: 32,
  y: 64 + (skin - 1) * 32,
  frameSize: [PADDLE_WIDTH, PADDLE_HEIGHT],
  tileSize: SHEET_TILE,
})

/**
 * The balls are 8x8 and sit in rows starting at (96, 48), so they are a third of a cell
 * wide. The original serves the first of them: its quad table starts at one, so the skin
 * it asks for by name is the one at x 96 rather than the one after it.
 */
export const ballFrame = (skin = 1) => {
  // Four skins sit along the first row and three along the second, both starting at
  // x 96, so the row is found by counting how many skins come before this one.
  const row = skin > 4 ? 1 : 0
  const column = skin - 1 - row * 4

  return {
    x: 96 + column * BALL_SIZE,
    y: 48 + row * BALL_SIZE,
    frameSize: [BALL_SIZE, BALL_SIZE],
    tileSize: SHEET_TILE,
  }
}

/**
 * `hearts.png` is a sheet of its own on a 10x9 grid, holding two hearts: a full one
 * first, then the empty one that stands in for a life already spent.
 */
export const heartFrame = (full) => ({
  x: full ? 0 : HEART_WIDTH,
  y: 0,
  frameSize: [HEART_WIDTH, HEART_HEIGHT],
  tileSize: [HEART_WIDTH, HEART_HEIGHT],
})

/**
 * Which tier of the sheet a brick with so many hits left sits in, and which colour of it.
 *
 * The bricks run five colours across each of four tiers, in one sequence, so the two fall
 * out of the hits left rather than being carried alongside them.
 */
export const brickTierOf = (hp) =>
  Math.floor((hp - BRICK_FIRST_COLOR) / BRICK_COLORS_PER_TIER)

export const brickColourOf = (hp) =>
  ((hp - BRICK_FIRST_COLOR) % BRICK_COLORS_PER_TIER) + BRICK_FIRST_COLOR

/**
 * The bricks are the first twenty quads of the sheet, and which one a brick is drawn from
 * is where its hits left put it: every four quads is one colour's four tiers, with the
 * tiers in order.
 *
 * A brick with nothing left on it is the first one on the sheet, which is the plain blue
 * brick every level started with before any of this existed.
 */
export const brickQuad = (hp = BRICK_FIRST_COLOR) =>
  (brickColourOf(hp) - BRICK_FIRST_COLOR) * 4 + brickTierOf(hp)

/**
 * Where that quad sits on the sheet.
 *
 * Six quads fit across, so a quad's own number is the same arithmetic any grid is: the
 * rest is the column and the rest again is the row. Said once here rather than by a
 * helper that crops as it goes.
 */
export const brickFrame = (hp = BRICK_FIRST_COLOR) => ({
  x: (brickQuad(hp) % SHEET_TILES_ACROSS) * BRICK_WIDTH,
  y: Math.floor(brickQuad(hp) / SHEET_TILES_ACROSS) * BRICK_HEIGHT,
  frameSize: [BRICK_WIDTH, BRICK_HEIGHT],
  tileSize: SHEET_TILE,
})
