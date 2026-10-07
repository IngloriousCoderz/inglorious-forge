import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

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
    entity.velocity[Y] = 300
    api.notify("soundPlay", "jump")
  },

  update(entity, dt, api) {
    const game = api.getEntity("game")
    if (game.state !== "play") return

    entity.velocity[Y] -= 980 * dt
    entity.position[Y] += entity.velocity[Y] * dt

    const hasCrashed =
      entity.position[Y] < 16 - 1 + 24 / 2 ||
      api.findCollision(entity, api.getEntities())

    if (hasCrashed) {
      api.notify("birdHit")
    }
  },
}
