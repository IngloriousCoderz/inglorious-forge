import { BOTTOM_CENTER, TOP_CENTER } from "@inglorious/engine/physics/anchor.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

import { BIRD_WIDTH, HEIGHT } from "../constants"

const X = 0
const Y = 1

// The side a pipe sits against decides both how it is anchored and which way it
// faces, because the texture carries its cap on top and only the pipe hanging
// from the ceiling is mirrored. Keeping the two together in one lookup is what
// stops the cap and the hitbox from drifting apart.
const SIDES = {
  ceiling: { anchor: TOP_CENTER, flipY: true },
  floor: { anchor: BOTTOM_CENTER, flipY: false },
}

export const Pipe = {
  render: renderImage,

  update(entity, dt, api) {
    const game = api.getEntity("game")
    if (game.state !== "play") return

    entity.position[X] += entity.velocity[X] * dt

    if (
      entity.side === "ceiling" &&
      !entity.scored &&
      hasPassedBird(entity, api)
    ) {
      entity.scored = true
      api.notify("pipeScored")
    }

    // Recycled once the whole pipe has left the screen on the left.
    if (entity.position[X] + 70 / 2 <= 0) {
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
  spawnPipe(api, "ceiling", gapY)
  spawnPipe(api, "floor", gapY - 90)
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
