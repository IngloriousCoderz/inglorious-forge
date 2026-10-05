import { findCollision } from "@inglorious/engine/collision/detection"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { random } from "@inglorious/utils/math/rng.js"
import { v } from "@inglorious/utils/v.js"

import { ballFrame } from "../atlas.js"
import { BALL_SIZE, SOUND_PADDLE_HIT, SOUND_WALL_HIT } from "../constants.js"

const X = 0
const Y = 1
const NO_DEPTH = 0
const FLIP = -1
const HIT_PADDLE = "Paddle"

// The serve. The original picks both axes at random, so the ball never starts on the
// same line twice: sideways anywhere between -200 and 200, and upwards between 50 and
// 60, which is downwards in the original's screen.
const SERVE_SIDEWAYS = 200
const SERVE_UPWARD = [50, 60]

/**
 * The ball, which serves upward out of the middle and then bounces off the walls and
 * the paddle.
 *
 * It carries its velocity directly rather than a direction and a speed, because that
 * is what the original does and it is what makes a paddle bounce nothing more than a
 * flip. Turning a bounce into a change of angle, and speeding the ball up with it, is
 * a later version of the original's idea.
 *
 * Pausing needs nothing here: a halted world never calls `update`.
 */
export const Ball = [
  {
    render: renderImage,

    create(entity) {
      entity.velocity = v(
        random(-SERVE_SIDEWAYS, SERVE_SIDEWAYS),
        random(...SERVE_UPWARD),
        NO_DEPTH,
      )

      // The crop is read off the entity and the grid off its image, so the frame is
      // split between the two.
      const frame = ballFrame()

      entity.image = {
        id: "breakout",
        imageSize: frame.imageSize,
        tileSize: frame.tileSize,
        frameSize: frame.frameSize,
      }
      entity.sx = frame.sx
      entity.sy = frame.sy
    },

    update(entity, dt, api) {
      move(entity, dt)

      bounceOffWalls(entity, api)
      bounceOffPaddle(entity, api)
    },
  },
]

function move(entity, dt) {
  entity.position[X] += entity.velocity[X] * dt
  entity.position[Y] += entity.velocity[Y] * dt
}

/**
 * The walls are the sides and the ceiling. There is no floor: the ball is supposed to
 * fall past the paddle, and losing a life for it comes later.
 *
 * Each side is checked against the ball's own size rather than the screen's, so it
 * stops flush with the wall instead of half overhanging it.
 */
function bounceOffWalls(entity, api) {
  const [width, height] = api.getEntity("game").size

  if (entity.position[X] <= 0) {
    entity.position[X] = 0
    entity.velocity[X] *= FLIP

    api.notify("soundPlay", SOUND_WALL_HIT)
  }

  if (entity.position[X] >= width - BALL_SIZE) {
    entity.position[X] = width - BALL_SIZE
    entity.velocity[X] *= FLIP

    api.notify("soundPlay", SOUND_WALL_HIT)
  }

  // The ceiling is the one wall whose altitude is not zero, since this world counts up
  // from the floor.
  if (entity.position[Y] >= height) {
    entity.position[Y] = height
    entity.velocity[Y] *= FLIP

    api.notify("soundPlay", SOUND_WALL_HIT)
  }
}

/**
 * Hitting the paddle flips the vertical velocity and nothing else, which is the whole
 * of the original's bounce at this stage.
 *
 * The collision is found rather than asked for, so that when the bricks arrive they can
 * be found the same way and told apart by what was hit.
 */
function bounceOffPaddle(entity, api) {
  const colliding = findCollision(entity, api.getEntities())

  if (colliding?.type !== HIT_PADDLE) return

  entity.velocity[Y] *= FLIP

  api.notify("soundPlay", SOUND_PADDLE_HIT)
}
