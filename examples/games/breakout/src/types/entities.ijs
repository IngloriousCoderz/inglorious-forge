import { v } from "@inglorious/utils/v.js"

import {
  BALL_SIZE,
  BALL_START_ALTITUDE,
  BALL_START_X,
  HEIGHT,
  LEFT_EDGE,
  PADDLE_ALTITUDE,
  PADDLE_HEIGHT,
  PADDLE_START_X,
  PADDLE_WIDTH,
  TOP_EDGE,
} from "../constants.js"

/**
 * The entities that stand on the floor while a game is being played.
 *
 * They are the things the original's `PlayState` builds when it is entered: the paddle,
 * the ball it serves, and the level above them.
 */

export function createPaddleEntity() {
  return {
    id: "paddle",
    type: "Paddle",
    layer: 1,
    position: v(PADDLE_START_X, PADDLE_ALTITUDE, 0),
    anchor: [LEFT_EDGE, TOP_EDGE],
    size: v(PADDLE_WIDTH, PADDLE_HEIGHT, 0),
    // The original collides the paddle with its whole bounding box rather than some
    // smaller shape inside it.
    solid: true,
    movement: {},
  }
}

/**
 * The ball is served from the middle, just clear of the paddle, and carries the skin the
 * original starts it with.
 *
 * Its hitbox is its whole 8x8, because the original collides with bounding boxes. The two
 * must not overlap at the serve, or the ball would be hit before it has moved.
 */
export function createBallEntity() {
  return {
    id: "ball",
    type: "Ball",
    layer: 2,
    position: v(BALL_START_X, BALL_START_ALTITUDE, 0),
    anchor: [LEFT_EDGE, TOP_EDGE],
    size: v(BALL_SIZE, BALL_SIZE, 0),
    // The ball collides with bounding boxes, like everything else here.
    solid: true,
  }
}

/** The level is made at random, so it is built on entry rather than listed anywhere. */
export function createPlayScene(bricks) {
  return [createPaddleEntity(), createBallEntity(), ...bricks]
}

export { HEIGHT }
