import {
  collidesWith,
  findCollision,
} from "@inglorious/engine/collision/detection"
import { crop } from "@inglorious/renderer-2d/image/crop.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { random } from "@inglorious/utils/math/rng.js"
import { filter } from "@inglorious/utils/object.js"
import { v } from "@inglorious/utils/v.js"

import { ballFrame } from "../atlas.js"
import {
  BALL_SIZE,
  BALL_SKIN_COUNT,
  FLOOR,
  GAME_STATE,
  PADDLE_WIDTH,
  SOUND_PADDLE_HIT,
  SOUND_WALL_HIT,
} from "../constants.js"

const X = 0
const Y = 1
const HALF = 2
const NO_DEPTH = 0
const FLIP = -1
const HIT_PADDLE = "Paddle"
const HIT_BRICK = "Brick"

// The original measures the ball from its centre when it works out which way to bounce
// it, so it is given a radius as well as a size.
const BALL_RADIUS = BALL_SIZE / HALF

// A hit near the edge of a moving paddle throws the ball off at an angle. These are the
// sideways speed it starts from and how much each pixel past the centre adds to it.
const BOUNCE_DX = 50
const BOUNCE_PER_PIXEL = 8

// Each brick hit quickens the game very slightly.
const BRICK_BOUNCE_Y = 1.02

/**
 * Where the middle of a box is.
 *
 * These sprites are anchored by their top left corner, because that is where the
 * original draws them from, so on a world counting up from the floor the centre sits
 * half a box *below* the position on the vertical axis and half a box to the right of
 * it on the horizontal one.
 */
function centreOf(entity) {
  const [width, height] = entity.size

  return [entity.position[X] + width / HALF, entity.position[Y] - height / HALF]
}

/** Which way to push a ball out of something: away from it. */
function awayFrom(delta) {
  return delta >= 0 ? 1 : -1
}

// The serve. The original picks both axes at random, so the ball never starts on the
// same line twice: sideways anywhere between -200 and 200, and upwards between 50 and
// 60, which is downwards in the original's screen.
const SERVE_SIDEWAYS = 200
const SERVE_UPWARD = [50, 60]

// The original numbers its ball skins from one, so the random pick is made over the
// same range it would make over in Lua.
const FIRST_SKIN = 1

/**
 * Puts the ball up ready to be served: a skin of its own, and a heading of its own.
 *
 * The original makes a new ball to do this at the start of every serve, so both the skin
 * and the heading are drawn afresh each time rather than kept from last serve.
 */
function serveRandomly(entity) {
  entity.skin = random(FIRST_SKIN, BALL_SKIN_COUNT)

  entity.velocity = v(
    random(-SERVE_SIDEWAYS, SERVE_SIDEWAYS),
    random(...SERVE_UPWARD),
    NO_DEPTH,
  )

  crop(entity, "breakout", ballFrame(entity.skin))
}

/**
 * While a serve is being waited out the ball sits on the paddle instead of moving.
 *
 * The original hangs it off the middle of the paddle, a ball's own height above the
 * paddle's own top edge, which is what leaves it resting on the paddle rather than
 * buried in it.
 */
function rideThePaddle(entity, api) {
  const paddle = api.getEntity("paddle")

  entity.position[X] =
    paddle.position[X] + PADDLE_WIDTH / HALF - BALL_SIZE / HALF
  entity.position[Y] = paddle.position[Y] + BALL_SIZE
}

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
      entity.velocity = v(NO_DEPTH, NO_DEPTH, NO_DEPTH)

      serveRandomly(entity)
    },

    // Every serve starts a new ball, which is this type's cue to draw a fresh skin and a
    // fresh heading. `stateChange` carries the id of whatever moved, so this is one of the
    // few places where checking who it was about is the right thing to do.
    stateChange(entity, { entityId, to }) {
      if (entityId !== entity.id) return

      if (to === GAME_STATE.serve) serveRandomly(entity)
    },

    update(entity, dt, api) {
      const game = api.getEntity("game")

      // Nothing moves under its own power until the serve is answered.
      if (game.state === GAME_STATE.serve) {
        rideThePaddle(entity, api)

        return
      }

      move(entity, dt)

      bounceOffWalls(entity, api)
      bounceOffPaddle(entity, api)
      knockOutBricks(entity, api)

      // There is no floor to bounce off. Falling past it is how a life is spent, which
      // is the game's business rather than the ball's: the ball only says that it fell.
      if (entity.position[Y] <= FLOOR) api.notify("ballLost")
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
 * Hitting the paddle lifts the ball clear of it and reverses it.
 *
 * The lift is what stops the ball being hit again on the very next frame: without it the
 * ball would still be inside the paddle it just bounced off.
 *
 * A hit near the edge of a paddle that is moving the same way as the ball throws the ball
 * off at an angle, which is the whole of the original's feel at this stage.
 */
function bounceOffPaddle(entity, api) {
  const paddle = findCollision(entity, api.getEntities())

  if (paddle?.type !== HIT_PADDLE) return

  entity.position[Y] = paddle.position[Y] + BALL_SIZE
  entity.velocity[Y] *= FLIP

  api.notify("soundPlay", SOUND_PADDLE_HIT)

  const isPaddleMovingLeft = paddle.velocity[X] < 0
  const isPaddleMovingRight = paddle.velocity[X] > 0
  const [paddleCentre] = centreOf(paddle)

  if (entity.position[X] < paddleCentre && isPaddleMovingLeft) {
    const past = paddleCentre - entity.position[X]

    entity.velocity[X] = -BOUNCE_DX - BOUNCE_PER_PIXEL * past
  } else if (entity.position[X] > paddleCentre && isPaddleMovingRight) {
    const past = entity.position[X] - paddleCentre

    entity.velocity[X] = BOUNCE_DX + BOUNCE_PER_PIXEL * past
  }
}

/**
 * Every brick the ball is touching is knocked out, and the ball bounces off the first
 * one it meets.
 *
 * The bounce is worked out from how deep the ball has sunk into the brick on each axis.
 * The shallower of the two is the side it went in by, so that is the axis it comes back
 * out on; the other would have it leaving through a face it did not pass through.
 *
 * The ball is pushed clear as well as reflected, otherwise it would stay overlapping the
 * brick it just hit and be told to bounce off it again next frame.
 */
function knockOutBricks(entity, api) {
  const bricks = filter(api.getEntities(), (_, { type }) => type === HIT_BRICK)

  for (const [id, brick] of Object.entries(bricks)) {
    if (!collidesWith(entity, brick)) continue

    // The brick's colour and tier are reported as they are at the moment of the hit,
    // which is what it was worth: the knock-back a hit causes changes both of them, and
    // whatever scores this cannot read them off the brick afterwards and get the same
    // answer.
    api.notify("brickHit", {
      id,
      color: brick.color,
      tier: brick.tier,
    })

    resolveBrickBounce(entity, brick)

    // Only one brick is answered per frame, so that a ball in the corner of two of them
    // picks one side rather than being bounced out of both.
    break
  }
}

function resolveBrickBounce(entity, brick) {
  const [brickWidth, brickHeight] = brick.size
  const [brickCentreX, brickCentreY] = centreOf(brick)
  const [ballCentreX, ballCentreY] = centreOf(entity)

  const [deltaX, deltaY] = [
    ballCentreX - brickCentreX,
    ballCentreY - brickCentreY,
  ]

  const [overlapX, overlapY] = [
    brickWidth / HALF + BALL_RADIUS - Math.abs(deltaX),
    brickHeight / HALF + BALL_RADIUS - Math.abs(deltaY),
  ]

  if (overlapX < overlapY) {
    entity.velocity[X] *= FLIP
    entity.position[X] += awayFrom(deltaX) * overlapX
  } else {
    entity.velocity[Y] *= FLIP
    entity.position[Y] += awayFrom(deltaY) * overlapY
  }

  // Applied whichever way it left, so every brick hit quickens the game a little.
  entity.velocity[Y] *= BRICK_BOUNCE_Y
}
