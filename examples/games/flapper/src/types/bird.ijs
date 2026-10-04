import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

import {
  BIRD_CRASH_Y,
  BIRD_FLAP_SPEED,
  BIRD_GRAVITY,
  GAME_STATE,
} from "../constants.js"

const Y = 1
const NO_VELOCITY = 0

export const Bird = {
  render: renderImage,

  create(entity) {
    entity.initialPosition = v(...entity.position)
  },

  reset(entity) {
    entity.position = entity.initialPosition
    entity.velocity[Y] = NO_VELOCITY
  },

  birdFlap(entity, _, api) {
    entity.velocity[Y] = BIRD_FLAP_SPEED
    api.notify("soundPlay", "jump")
  },

  update(entity, dt, api) {
    const game = api.getEntity("game")
    if (game.state !== GAME_STATE.play) return

    entity.velocity[Y] -= BIRD_GRAVITY * dt
    entity.position[Y] += entity.velocity[Y] * dt

    const hasCrashed =
      entity.position[Y] < BIRD_CRASH_Y ||
      api.findCollision(entity, api.getEntities())

    if (hasCrashed) {
      api.notify("birdHit")
    }
  },
}
