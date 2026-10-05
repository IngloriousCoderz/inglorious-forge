import { crop } from "@inglorious/renderer-2d/image/crop.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"

import { heartFrame } from "../atlas.js"

/**
 * One heart of the health readout.
 *
 * There are always three of them, one for each life the player starts with, and which of
 * the two hearts a given one draws depends on how many lives are left: the hearts fill up
 * from the left, so a heart standing for the first life shows itself as full while that
 * life is in hand.
 *
 * It is therefore asked every frame rather than told once, since the number of lives in
 * hand is the one thing on the field that changes without anything happening to it.
 */
export const Heart = {
  render: renderImage,

  update(entity, dt, api) {
    const { health } = api.getEntity("game")

    crop(entity, "hearts", heartFrame(entity.heart < health))
  },
}
