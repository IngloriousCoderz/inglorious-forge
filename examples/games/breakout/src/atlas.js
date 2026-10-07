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

// `breakout.png` is cut on the original's own `GenerateQuads(atlas, 32, 16)`. The tile is
// named apart from a brick's own size because the two are only the same by accident: the
// sheet is cut a certain way, a brick is drawn a certain size.
export const SHEET_TILE = [32, 16]

// Quads are numbered in reading order down the sheet, so a quad's own number divided by
// this is the row it sits in and the rest of it is the column.
export const SHEET_TILES_ACROSS = 6

// Four colours, two rows deep: blue on row 4, then green, red and purple one row apart.
// Within a band the widths sit flush, so a 64 wide paddle starts a whole 32 wide paddle in.
export const paddleFrame = (skin = 1) => ({
  x: 32,
  y: 64 + (skin - 1) * 32,
  frameSize: [PADDLE_WIDTH, PADDLE_HEIGHT],
  tileSize: SHEET_TILE,
})

// Four balls along the first row at (96, 48) and three along the second.
export const ballFrame = (skin = 1) => {
  const row = skin > 4 ? 1 : 0
  const column = skin - 1 - row * 4

  return {
    x: 96 + column * BALL_SIZE,
    y: 48 + row * BALL_SIZE,
    frameSize: [BALL_SIZE, BALL_SIZE],
    tileSize: SHEET_TILE,
  }
}

export const heartFrame = (full) => ({
  x: full ? 0 : HEART_WIDTH,
  y: 0,
  frameSize: [HEART_WIDTH, HEART_HEIGHT],
  tileSize: [HEART_WIDTH, HEART_HEIGHT],
})

// The bricks run five colours across each of four tiers in one sequence, so where a brick
// sits falls out of the hits it has left rather than being carried alongside it.
export const brickTierOf = (hp) =>
  Math.floor((hp - BRICK_FIRST_COLOR) / BRICK_COLORS_PER_TIER)

export const brickColourOf = (hp) =>
  ((hp - BRICK_FIRST_COLOR) % BRICK_COLORS_PER_TIER) + BRICK_FIRST_COLOR

export const brickQuad = (hp = BRICK_FIRST_COLOR) =>
  (brickColourOf(hp) - BRICK_FIRST_COLOR) * 4 + brickTierOf(hp)

export const brickFrame = (hp = BRICK_FIRST_COLOR) => ({
  x: (brickQuad(hp) % SHEET_TILES_ACROSS) * BRICK_WIDTH,
  y: Math.floor(brickQuad(hp) / SHEET_TILES_ACROSS) * BRICK_HEIGHT,
  frameSize: [BRICK_WIDTH, BRICK_HEIGHT],
  tileSize: SHEET_TILE,
})
