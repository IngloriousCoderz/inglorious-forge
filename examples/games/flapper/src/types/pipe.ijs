import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

import { BIRD_WIDTH, HEIGHT } from "../constants"

const X = 0
const Y = 1
const CENTERED = 0.5
const BOTTOM_EDGE = 0
const TOP_EDGE = 1
const LEFT_EDGE = 0

// Vertically the pipe is pinned to the gap, which is where its cap belongs, so
// each pipe grows away from the opening: the ceiling one upwards from the gap,
// the floor one downwards from it.
const TOP_ANCHOR = [CENTERED, TOP_EDGE]
const BOTTOM_ANCHOR = [CENTERED, BOTTOM_EDGE]

const CEILING = "ceiling"
const FLOOR = "floor"

// The side a pipe sits against decides both how it is anchored and which way it
// faces, because the texture carries its cap on top and only the pipe hanging
// from the ceiling is mirrored. Keeping the two together in one lookup is what
// stops the cap and the hitbox from drifting apart.
const SIDES = {
  [CEILING]: { anchor: BOTTOM_ANCHOR, flipY: true },
  [FLOOR]: { anchor: TOP_ANCHOR, flipY: false },
}

export const Pipe = {
  render: renderImage,

  update(entity, dt, api) {
    const game = api.getEntity("game")
    if (game.state !== "play") return

    entity.position[X] += entity.velocity[X] * dt

    if (
      entity.side === CEILING &&
      !entity.scored &&
      hasPassedBird(entity, api)
    ) {
      entity.scored = true
      api.notify("pipeScored")
    }

    // Recycled once the whole pipe has left the screen on the left.
    if (entity.position[X] + 70 / 2 <= LEFT_EDGE) {
      api.notify("despawn", entity)
    }
  },
}

/**
 * Spawns a pair of pipes leaving a `90` tall opening whose top sits at
 * the altitude `gapY`: the ceiling pipe stands on that top edge, and the floor
 * one hangs from the bottom of the gap.
 */
export function spawnPipePair(api, gapY) {
  spawnPipe(api, CEILING, gapY)
  spawnPipe(api, FLOOR, gapY - 90)
}

function spawnPipe(api, side, altitude) {
  const { anchor, flipY } = SIDES[side]

  api.notify("spawn", {
    type: "Pipe",
    side,
    scored: false,
    layer: -2,
    position: v(512 + 32, altitude, 0),
    velocity: v(-60, 0, 0),
    // One anchor places the sprite, its hitbox and its gizmo together.
    anchor,
    size: v(70, HEIGHT, 0),
    collisions: { hitbox: { shape: "rectangle" } },
    flipY,
    image: {
      id: "pipe",
      imageSize: [v(70, HEIGHT, 0)[X], v(70, HEIGHT, 0)[Y]],
    },
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
    entity.position[X] + v(70, HEIGHT, 0)[X] / 2 <
    bird.position[X] - BIRD_WIDTH / 2
  )
}
