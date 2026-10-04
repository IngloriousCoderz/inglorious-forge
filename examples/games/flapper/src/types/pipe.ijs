/* eslint-disable no-magic-numbers */

import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

import {
  BIRD_WIDTH,
  GAME_STATE,
  GAP_HEIGHT,
  LAYER_PIPES,
  PIPE_HEIGHT,
  PIPE_SIZE,
  PIPE_SPAWN_X,
  PIPE_SPEED,
  PIPE_WIDTH,
} from "../constants.js"

const X = 0
const Y = 1
const HALF = 2

// Centred horizontally, so that the tile lines up with the hitbox, which the
// engine resolves around the entity position. Vertically the tile is anchored on
// the gap, because that is where its cap belongs.
const TOP_ANCHOR = [0.5, 0]
const BOTTOM_ANCHOR = [0.5, 1]

export const Pipe = {
  render: renderImage,

  update(entity, dt, api) {
    const game = api.getEntity("game")
    if (game.state !== GAME_STATE.play) return

    entity.position[X] += entity.velocity[X] * dt

    if (entity.isUpper && !entity.scored && hasPassedBird(entity, api)) {
      entity.scored = true
      api.notify("pipeScored")
    }

    // Recycled once the whole pipe has left the screen on the left.
    if (entity.position[X] + PIPE_WIDTH / HALF <= 0) {
      api.notify("despawn", entity)
    }
  },
}

/**
 * Spawns a pair of pipes leaving a `gapY` wide opening, where `gapY` is the
 * altitude of the lower edge of the gap.
 */
export function spawnPipePair(api, gapY) {
  ;[true, false].forEach((isUpper) => {
    api.notify("spawn", {
      type: "Pipe",
      isUpper,
      scored: false,
      layer: LAYER_PIPES,
      // The ceiling pipe hangs from the lower edge of the gap, the floor one
      // stands on its upper edge, so both grow away from the opening.
      position: v(PIPE_SPAWN_X, isUpper ? gapY : gapY - GAP_HEIGHT, 0),
      velocity: v(-PIPE_SPEED, 0, 0),
      size: PIPE_SIZE,
      collisions: {
        // The tile is anchored on the gap, while the solid column it stands for
        // reaches all the way to the opposite edge of the screen.
        hitbox: {
          shape: "rectangle",
          offset: v(0, isUpper ? PIPE_HEIGHT / HALF : -PIPE_HEIGHT / HALF, 0),
        },
      },
      // The texture carries its cap on top, so only the pipe hanging from the
      // ceiling has to be mirrored to keep both caps next to the gap.
      flipY: isUpper,
      image: {
        id: "pipe",
        imageSize: [PIPE_SIZE[X], PIPE_SIZE[Y]],
        anchor: isUpper ? BOTTOM_ANCHOR : TOP_ANCHOR,
      },
    })
  })
}

export function clearPipes(api) {
  api.getAllActivePoolEntities().forEach((entity) => {
    if (entity.type === "Pipe") {
      api.notify("despawn", entity)
    }
  })
}

function hasPassedBird(entity, api) {
  const bird = api.getEntity("bird")

  return (
    entity.position[X] + PIPE_SIZE[X] / HALF <
    bird.position[X] - BIRD_WIDTH / HALF
  )
}
