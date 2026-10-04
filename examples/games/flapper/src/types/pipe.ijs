import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

import {
  BIRD_WIDTH,
  GAME_STATE,
  GAP_HEIGHT,
  LAYER_PIPES,
  NO_DEPTH,
  NO_RISE,
  PIPE_SIZE,
  PIPE_SPAWN_X,
  PIPE_SPEED,
  PIPE_WIDTH,
} from "../constants.js"

const X = 0
const Y = 1
const HALF = 2
const CENTERED = 0.5
const BOTTOM_EDGE = 0
const TOP_EDGE = 1
const LEFT_EDGE = 0

// Vertically the pipe is pinned to the gap, which is where its cap belongs, so
// each pipe grows away from the opening: the ceiling one upwards from the gap,
// the floor one downwards from it.
const TOP_ANCHOR = [CENTERED, TOP_EDGE]
const BOTTOM_ANCHOR = [CENTERED, BOTTOM_EDGE]

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
    if (entity.position[X] + PIPE_WIDTH / HALF <= LEFT_EDGE) {
      api.notify("despawn", entity)
    }
  },
}

/**
 * Spawns a pair of pipes leaving a `GAP_HEIGHT` tall opening whose top sits at
 * the altitude `gapY`.
 */
export function spawnPipePair(api, gapY) {
  ;[true, false].forEach((isUpper) => {
    api.notify("spawn", {
      type: "Pipe",
      isUpper,
      scored: false,
      layer: LAYER_PIPES,
      // `gapY` is the altitude of the top of the gap, so the ceiling pipe stands
      // on it and the floor one hangs from the gap's lower edge.
      position: v(PIPE_SPAWN_X, isUpper ? gapY : gapY - GAP_HEIGHT, NO_DEPTH),
      velocity: v(-PIPE_SPEED, NO_RISE, NO_DEPTH),
      // One anchor places the sprite, its hitbox and its gizmo together.
      anchor: isUpper ? BOTTOM_ANCHOR : TOP_ANCHOR,
      size: PIPE_SIZE,
      collisions: { hitbox: { shape: "rectangle" } },
      // The texture carries its cap on top, so only the pipe hanging from the
      // ceiling has to be mirrored to keep both caps next to the gap.
      flipY: isUpper,
      image: {
        id: "pipe",
        imageSize: [PIPE_SIZE[X], PIPE_SIZE[Y]],
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
