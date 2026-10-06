import { cropQuad } from "@inglorious/renderer-2d/image/crop-quad.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"

import { brickQuad, SHEET_TILE, SHEET_TILES_ACROSS } from "../atlas.js"
import {
  BRICK_FIRST_COLOR,
  BRICK_FIRST_TIER,
  BRICK_MAX_COLOR,
  SOUND_BRICK_BROKEN,
  SOUND_BRICK_HIT,
} from "../constants.js"

/**
 * A brick the ball can knock down a piece at a time.
 *
 * Which brick of the twenty it is drawn from is not its own to decide: the level says
 * what colour and tier each one is, because that is what makes two rows of the same
 * level look different from each other.
 *
 * A hit knocks it back rather than removing it. Within a tier a brick goes down through
 * the five colours, and at the first colour it drops a tier and comes back round at the
 * last; only at the first colour of the first tier is there nothing left to knock off, and
 * that is when it leaves. So the highest brick takes ten hits and the lowest takes one,
 * which is what makes a level's colour worth something.
 *
 * The hit is announced rather than taken as a message, so that whatever scores the hit
 * does not have to be the thing that found the collision. It carries the colour and the
 * tier the brick had when it was hit, because that is what it was worth at the time.
 */
export const Brick = {
  render: renderImage,

  create(entity) {
    crop(entity)
  },

  // The hit is broadcast, so every brick in the game hears it and only the one it names
  // was hit. This is why the check is here: without it a single hit knocks back every
  // brick on the level at once.
  brickHit(entity, { id }, api) {
    if (id !== entity.id) return

    api.notify("soundPlay", SOUND_BRICK_HIT)

    if (!knockBack(entity)) {
      api.notify("soundPlay", SOUND_BRICK_BROKEN)

      api.notify("remove", id)

      return
    }

    crop(entity)
  },
}

/**
 * Knocks a brick back one step along the sheet, and says whether there was anything left
 * to knock.
 *
 * A brick is five colours of four tiers, and the order runs down the colours of a tier
 * and then on to the tier below, wrapping round at the last colour. That ordering is the
 * original's: a brick knocked back steps towards the plain blue one at the bottom of the
 * sheet, so a high brick is knocked down through the tiers before it is cleared away.
 */
function knockBack(entity) {
  if (entity.tier > BRICK_FIRST_TIER) {
    if (entity.color === BRICK_FIRST_COLOR) {
      entity.tier -= ONE
      entity.color = BRICK_MAX_COLOR
    } else {
      entity.color -= ONE
    }

    return true
  }

  if (entity.color === BRICK_FIRST_COLOR) return false

  entity.color -= ONE

  return true
}

/** Cuts the entity's image to the frame its own colour and tier now name. */
function crop(entity) {
  cropQuad(entity, "breakout", brickQuad(entity.color, entity.tier), {
    tileSize: SHEET_TILE,
    tilesAcross: SHEET_TILES_ACROSS,
  })
}

const ONE = 1
