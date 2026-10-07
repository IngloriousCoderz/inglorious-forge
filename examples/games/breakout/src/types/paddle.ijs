import { createMovementEventHandlers } from "@inglorious/engine/behaviors/controls/event-handlers.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { clamp } from "@inglorious/utils/math/number.js"
import { v } from "@inglorious/utils/v.js"

import { paddleFrame } from "../atlas.js"
import { PADDLE_SPEED, PADDLE_WIDTH, WIDTH } from "../constants.js"

const X = 0

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
      entity.velocity = v(0, 0, 0)

      entity.image = {
        ...entity.image,
        id: "breakout",
        ...paddleFrame(entity.skin),
      }
    },

    update(entity, dt) {
      const { movement = {} } = entity

      entity.velocity = [
        (movement.moveRight ? PADDLE_SPEED : 0) -
          (movement.moveLeft ? PADDLE_SPEED : 0),
        0,
        0,
      ]

      // The paddle has to stay wholly on screen, so it is bounded by its own width
      // rather than by its position.
      entity.position[X] = clamp(
        entity.position[X] + entity.velocity[X] * dt,
        0,
        WIDTH - PADDLE_WIDTH,
      )
    },
  },

  // Turns the held arrow keys into the movement flags read above.
  createMovementEventHandlers(["moveLeft", "moveRight"]),
]
