import { emitBurst } from "@inglorious/engine/behaviors/particles.js"
import { cropQuad } from "@inglorious/renderer-2d/image/crop-quad.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

import {
  brickColourOf,
  brickQuad,
  brickTierOf,
  SHEET_TILE,
  SHEET_TILES_ACROSS,
} from "../atlas.js"
import {
  BRICK_COLORS,
  LAYER_PARTICLE,
  PARTICLE_ACCELERATION_FALL,
  PARTICLE_ACCELERATION_SIDEWAYS,
  PARTICLE_ALPHA_PER_TIER,
  PARTICLE_COUNT,
  PARTICLE_LIFETIME,
  PARTICLE_SIZE,
  PARTICLE_SPREAD,
  SOUND_BRICK_BROKEN,
  SOUND_BRICK_HIT,
} from "../constants.js"

/**
 * A brick the ball can knock down a piece at a time.
 *
 * How many hits a brick has left is what decides where it is drawn from and what it is
 * worth, because the sheet's bricks run in one unbroken sequence from the plain blue one at
 * the top to the hardest at the bottom. So a brick carries `hp` and nothing else about
 * itself, and being hit takes one off it -- the original's two fields and its ordering of
 * them are the same number written out longhand.
 *
 * That leaves the hardest brick taking ten hits and the plainest one taking a single hit,
 * which is what makes a level's bricks worth choosing.
 *
 * The hit is announced rather than taken as a message, so that whatever scores the hit
 * does not have to be the thing that found the collision. It carries the hits the brick had
 * left when it was hit, because that is what it was worth at the time.
 */
export const Brick = {
  render: renderImage,

  create(entity) {
    crop(entity)
  },

  // The hit is broadcast, so every brick in the game hears it and only the one it names
  // was hit. This is why the check is here: without it a single hit knocks down every
  // brick on the level at once.
  brickHit(entity, { id }, api) {
    if (id !== entity.id) return

    api.notify("soundPlay", SOUND_BRICK_HIT)

    knockOff(entity, api)

    entity.hp -= ONE

    if (entity.hp < ONE) {
      api.notify("soundPlay", SOUND_BRICK_BROKEN)

      api.notify("remove", id)

      return
    }

    crop(entity)
  },
}

/**
 * Throws a brick's own colour off it, in the middle of it and falling.
 *
 * The colour is the brick's and how opaque it starts is its tier's, so a brick further
 * down the sheet throws brighter debris. The original fades the debris from that opacity to
 * nothing over its lifetime, which is what the particle does on its own, so only the
 * starting opacity is worth saying here.
 *
 * It is thrown before the hit is taken off, so the debris is coloured by the brick as it
 * was hit rather than as it is now leaving.
 */
function knockOff(entity, api) {
  const [width, height] = entity.size
  const spread = v(PARTICLE_SPREAD, PARTICLE_SPREAD, NO_DEPTH)
  const fall = -PARTICLE_ACCELERATION_FALL
  const tier = brickTierOf(entity.hp)

  emitBurst(api, {
    count: PARTICLE_COUNT,
    position: v(
      entity.position[X] + width / HALF,
      entity.position[Y] - height / HALF,
      NO_DEPTH,
    ),
    spread,
    size: v(PARTICLE_SIZE, PARTICLE_SIZE, NO_DEPTH),
    lifetime: PARTICLE_LIFETIME,
    // Downwards in the original, which counts from the top of the screen. This world
    // counts from the floor, so falling is the smaller of the two.
    acceleration: [
      v(-PARTICLE_ACCELERATION_SIDEWAYS, fall, NO_DEPTH),
      v(PARTICLE_ACCELERATION_SIDEWAYS, NO_DEPTH, NO_DEPTH),
    ],
    opacity: PARTICLE_ALPHA_PER_TIER * (tier + ONE),
    layer: LAYER_PARTICLE,
    tint: BRICK_COLORS[brickColourOf(entity.hp)],
    image: { id: "particle", imageSize: [PARTICLE_SIZE, PARTICLE_SIZE] },
  })
}

/** Cuts the entity's image to the frame however many hits it has left put it. */
function crop(entity) {
  cropQuad(entity, "breakout", brickQuad(entity.hp), {
    tileSize: SHEET_TILE,
    tilesAcross: SHEET_TILES_ACROSS,
  })
}

const X = 0
const Y = 1
const HALF = 2
const NO_DEPTH = 0
const ONE = 1
