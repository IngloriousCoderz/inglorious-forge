import { emitBurst } from "@inglorious/engine/behaviors/particles.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

import { brickColourOf, brickFrame, brickTierOf } from "../atlas.js"

// The colours of the five bricks on the sheet, which the debris of a knocked brick is
// coloured to match. These are the original's own values rather than anything read off
// the artwork, which is what a particle needs: it is drawn in the brick's colour, not in
// the colour of the pixels that happen to be there.
export const BRICK_COLORS = {
  1: "rgb(99, 155, 255)",
  2: "rgb(106, 190, 47)",
  3: "rgb(217, 87, 99)",
  4: "rgb(215, 123, 186)",
  5: "rgb(251, 242, 54)",
}

const X = 0
const Y = 1
const HALF = 2
const NO_DEPTH = 0
const ONE = 1

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
 * The hit is announced rather than taken as a message, so that whatever scores the hit does
 * not have to be the thing that found the collision. It carries the hits the brick had left
 * when it was hit, because that is what it was worth at the time.
 */
export const Brick = {
  render: renderImage,

  create(entity) {
    entity.image = { ...entity.image, id: "breakout", ...brickFrame(entity.hp) }
  },

  // The hit is broadcast, so every brick in the game hears it and only the one it names
  // was hit. This is why the check is here: without it a single hit knocks down every
  // brick on the level at once.
  brickHit(entity, { id }, api) {
    if (id !== entity.id) return

    api.notify("soundPlay", "brickHit")

    knockOff(entity, api)

    entity.hp -= ONE

    if (entity.hp < ONE) {
      api.notify("soundPlay", "brickBroken")

      api.notify("remove", id)

      return
    }

    entity.image = { ...entity.image, id: "breakout", ...brickFrame(entity.hp) }
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
  const spread = v(10, 10, NO_DEPTH)
  const fall = -80
  const tier = brickTierOf(entity.hp)

  emitBurst(api, {
    count: 64,
    position: v(
      entity.position[X] + width / HALF,
      entity.position[Y] - height / HALF,
      NO_DEPTH,
    ),
    spread,
    size: v(8, 8, NO_DEPTH),
    lifetime: [0.5, 1],
    // Downwards in the original, which counts from the top of the screen. This world
    // counts from the floor, so falling is the smaller of the two.
    acceleration: [v(-15, fall, NO_DEPTH), v(15, NO_DEPTH, NO_DEPTH)],
    opacity: (55 / 255) * (tier + ONE),
    layer: 0.5,
    tint: BRICK_COLORS[brickColourOf(entity.hp)],
    image: { id: "particle", imageSize: [8, 8] },
  })
}
