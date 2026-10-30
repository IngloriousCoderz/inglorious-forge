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

export const SHEET_TILE = [32, 16]

export const SHEET_TILES_ACROSS = 6

export const paddleFrame = (skin = 1) => ({
  x: 32,
  y: 64 + (skin - 1) * 32,
  frameSize: [PADDLE_WIDTH, PADDLE_HEIGHT],
  tileSize: SHEET_TILE,
})

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
