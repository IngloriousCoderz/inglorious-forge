import { cropQuad } from "@inglorious/renderer-2d/image/crop-quad.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"

import { brickQuad, SHEET_TILE, SHEET_TILES_ACROSS } from "../atlas.js"
import { SOUND_BRICK_HIT } from "../constants.js"

/**
 * A brick the ball can knock out of the way.
 *
 * Which brick of the twenty it is drawn from is not its own to decide: the level says
 * what colour and tier each one is, because that is what makes two rows of the same
 * level look different from each other. It carries that pair and nothing else.
 *
 * Being hit removes it, which is what the original's `inPlay = false` amounts to when the
 * entities are managed for us. The hit is announced rather than taken as a message, so
 * that whatever scores the hit does not have to be the thing that found the collision.
 */
export const Brick = {
  render: renderImage,

  create(entity) {
    cropQuad(entity, "breakout", brickQuad(entity.color, entity.tier), {
      tileSize: SHEET_TILE,
      tilesAcross: SHEET_TILES_ACROSS,
    })
  },

  brickHit(entity, id, api) {
    api.notify("soundPlay", SOUND_BRICK_HIT)

    api.notify("remove", id)
  },
}
