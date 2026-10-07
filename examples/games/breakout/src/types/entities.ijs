import { v } from "@inglorious/utils/v.js"

import {
  BALL_SIZE,
  FIRST_PADDLE_SKIN,
  HEART_HEIGHT,
  HEART_WIDTH,
  HEIGHT,
  LEFT_EDGE,
  MAX_HEALTH,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  TOP_EDGE,
} from "../constants.js"

const CEILING = HEIGHT - 5

export function createPaddleEntity(skin = FIRST_PADDLE_SKIN) {
  return {
    id: "paddle",
    type: "Paddle",
    layer: 1,
    skin,
    position: v(432 / 2 - 32, 16 * 2, 0),
    anchor: [LEFT_EDGE, TOP_EDGE],
    size: v(PADDLE_WIDTH, PADDLE_HEIGHT, 0),
    solid: true,
    movement: {},
  }
}

export function createBallEntity() {
  return {
    id: "ball",
    type: "Ball",
    skin: 1,
    layer: 2,
    position: v(432 / 2 - 4, 42, 0),
    anchor: [LEFT_EDGE, TOP_EDGE],
    size: v(BALL_SIZE, BALL_SIZE, 0),
    solid: true,
  }
}

/** Three of them always, full while the life each stands for is in hand. */
export function createHeartEntity(index) {
  return {
    id: `heart${index}`,
    type: "Heart",
    layer: 2,
    position: v(432 - 100 + index * 11, CEILING, 0),
    anchor: [LEFT_EDGE, TOP_EDGE],
    size: v(HEART_WIDTH, HEART_HEIGHT, 0),
    heart: index,
  }
}

export function createPlayScene(bricks, paddleSkin = FIRST_PADDLE_SKIN) {
  return [
    createPaddleEntity(paddleSkin),
    createBallEntity(),
    ...bricks,
    ...Array.from({ length: MAX_HEALTH }, (_, index) =>
      createHeartEntity(index),
    ),
  ]
}
