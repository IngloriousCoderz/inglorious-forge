import { crop } from "@inglorious/renderer-2d/image/crop.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"

import { brickFrame } from "../atlas.js"
import { SOUND_BRICK_HIT } from "../constants.js"

/**
 * A brick the ball can knock out of the way.
 *
 * It carries no state of its own: being hit removes it, which is what the original's
 * `inPlay = false` amounts to when the entities are managed for us. The hit is announced
 * rather than taken as a message, so that whatever scores the hit does not have to be
 * the thing that found the collision.
 */
export const Brick = {
  render: renderImage,

  create(entity) {
    crop(entity, "breakout", brickFrame())
  },

  brickHit(entity, id, api) {
    api.notify("soundPlay", SOUND_BRICK_HIT)

    api.notify("remove", id)
  },
}
