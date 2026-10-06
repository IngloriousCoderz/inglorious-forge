import {
  BALL_SIZE,
  BALL_SKIN_FIRST_ROW,
  BRICK_FIRST_COLOR,
  BRICK_FIRST_TIER,
  BRICK_HEIGHT,
  BRICK_TIERS_PER_COLOR,
  BRICK_WIDTH,
  HEART_HEIGHT,
  HEART_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from "./constants.js"

// Every sprite is cut from the same sheet on its own 32x16 grid. A frame says where it
// is on the sheet and how much of it to take, in pixels, and `crop` divides that down to
// the grid for the renderer.
const TILE = [32, 16]

// The sheet is this many tiles across, which is what a quad's own number has to be
// divided by to say where it sits. The original numbers its quads in reading order down
// the sheet, so on a sheet six across, the seventh quad is the first tile of the second
// row rather than anything further along the first.
const TILES_ACROSS = 6

/** Where the nth quad of the sheet is, in pixels. */
function frameAt(quad, size) {
  const [tileWidth, tileHeight] = TILE

  return {
    x: (quad % TILES_ACROSS) * tileWidth,
    y: Math.floor(quad / TILES_ACROSS) * tileHeight,
    ...size,
    tileSize: TILE,
  }
}

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
export const ballFrame = (skin = 1) => {
  // Four skins sit along the first row and three along the second, both starting at
  // x 96, so the row is found by counting how many skins come before this one.
  const row = skin > BALL_SKIN_FIRST_ROW ? 1 : 0
  const column = skin - 1 - row * BALL_SKIN_FIRST_ROW

  return {
    x: 96 + column * BALL_SIZE,
    y: 48 + row * BALL_SIZE,
    width: BALL_SIZE,
    height: BALL_SIZE,
    tileSize: TILE,
  }
}

/**
 * `hearts.png` is a sheet of its own on a 10x9 grid, holding two hearts: a full one
 * first, then the empty one that stands in for a life already spent.
 */
export const HEART_TILE = [HEART_WIDTH, HEART_HEIGHT]

export const heartFrame = (full) => ({
  x: full ? 0 : HEART_WIDTH,
  y: 0,
  width: HEART_WIDTH,
  height: HEART_HEIGHT,
  tileSize: HEART_TILE,
})

/**
 * The bricks are the first twenty quads of the sheet, and which one a brick is drawn
 * from is its colour and its tier: every four quads is one colour's four tiers, with the
 * tiers in order.
 *
 * A brick with no colour or tier of its own is the first one on the sheet, which is the
 * plain blue brick every level started with before either of them existed.
 */
export const brickFrame = (
  color = BRICK_FIRST_COLOR,
  tier = BRICK_FIRST_TIER,
) =>
  frameAt((color - BRICK_FIRST_COLOR) * BRICK_TIERS_PER_COLOR + tier, {
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
  })
