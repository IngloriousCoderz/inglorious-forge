import { createMovementEventHandlers } from "@inglorious/engine/behaviors/controls/event-handlers.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { clamp } from "@inglorious/utils/math/numbers.js"
import { ZERO_VECTOR } from "@inglorious/utils/math/vectors"
import { v } from "@inglorious/utils/v.js"

import { paddleFrame } from "../atlas.js"
import {
  ATLAS_ID,
  GAME_STATE,
  LEFT_EDGE,
  NO_DEPTH,
  PADDLE_SPEED,
  PADDLE_WIDTH,
  WIDTH,
} from "../constants.js"

const X = 0
const Y = 1
const NO_SPEED = 0
const LEFT = -1
const RIGHT = 1

/**
 * The paddle slides along the floor while it is being played, and stops dead while
 * the game is paused.
 *
 * Its movement is written out here rather than borrowed, for two reasons: the
 * bounds are the paddle's own (it must stay wholly on screen, not merely its
 * position), and a paused game has to be able to stop it, which a behaviour that
 * moves the entity after you cannot do.
 */
export const Paddle = [
  {
    render: renderImage,

    create(entity) {
      entity.velocity = v(NO_SPEED, NO_SPEED, NO_DEPTH)

      // `renderImage` reads the crop offsets off the entity, but the grid and the
      // frame size off the image, so the frame is split between the two.
      const frame = paddleFrame()

      entity.image = {
        id: ATLAS_ID,
        imageSize: frame.imageSize,
        tileSize: frame.tileSize,
        frameSize: frame.frameSize,
      }
      entity.sx = frame.sx
      entity.sy = frame.sy
    },

    update(entity, dt, api) {
      const game = api.getEntity("game")

      entity.velocity = [...ZERO_VECTOR]

      if (game.state !== GAME_STATE.play) return

      const { movement = {} } = entity

      if (movement.moveLeft) entity.velocity[X] = PADDLE_SPEED * LEFT
      if (movement.moveRight) entity.velocity[X] = PADDLE_SPEED * RIGHT

      entity.position[X] = clamp(
        entity.position[X] + entity.velocity[X] * dt,
        LEFT_EDGE,
        WIDTH - PADDLE_WIDTH,
      )
    },
  },

  // Turns the held arrow keys into the movement flags read above.
  createMovementEventHandlers(["moveLeft", "moveRight"]),
]

export { X, Y }
