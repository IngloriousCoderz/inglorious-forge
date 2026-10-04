import { v } from "@inglorious/utils/v.js"
import { expect, test } from "vitest"

import { anchorMargins, shapeAnchor } from "../physics/anchor.js"
import { collidesWith, findCollision } from "./detection.js"

const X = 0
const Y = 1
const BIRD = v(38, 24, 0)
const HITBOX = v(34, 20, 0)

/** Where a box ends up, in world coordinates, on each axis. */
function edgesOf(entity, group = "hitbox") {
  const collision = entity.collisions[group]
  const size = collision.size ?? entity.size
  const { before, after } = anchorMargins(shapeAnchor(entity, collision), size)

  return [
    [entity.position[X] - before[X], entity.position[X] + after[X]],
    [entity.position[Y] - before[Y], entity.position[Y] + after[Y]],
  ]
}

test("a centred hitbox straddles its position", () => {
  const bird = {
    position: v(100, 100, 0),
    size: BIRD,
    collisions: { hitbox: { shape: "rectangle", size: HITBOX } },
  }

  expect(edgesOf(bird)).toStrictEqual([
    [83, 117],
    [90, 110],
  ])
})

test("a bottom-anchored hitbox stands on its position", () => {
  const platform = {
    position: v(100, 0, 0),
    size: v(64, 16, 0),
    anchor: [0, 1],
    collisions: { hitbox: { shape: "rectangle" } },
  }

  expect(edgesOf(platform)).toStrictEqual([
    [100, 164],
    [0, 16],
  ])
})

test("a hitbox should follow the anchor of the sprite it belongs to", () => {
  const tile = {
    position: v(100, 0, 0),
    image: { id: "tile", imageSize: [64, 16], anchor: [0, 1] },
    size: v(64, 16, 0),
    collisions: { hitbox: { shape: "rectangle" } },
  }

  expect(edgesOf(tile)).toStrictEqual([
    [100, 164],
    [0, 16],
  ])
})

test("a hitbox may pin itself differently from its sprite", () => {
  const tile = {
    position: v(100, 8, 0),
    anchor: [0, 1],
    size: v(64, 16, 0),
    collisions: { hitbox: { shape: "rectangle", anchor: [0.5, 0.5] } },
  }

  expect(edgesOf(tile)).toStrictEqual([
    [68, 132],
    [0, 16],
  ])
})

test("an anchored platform should only be stood on from above", () => {
  const ground = { type: "Ground", devMode: false }
  const platform = {
    id: "platform",
    type: "Platform",
    position: v(100, 0, 0),
    size: v(64, 16, 0),
    anchor: [0, 1],
    collisions: { hitbox: { shape: "rectangle" } },
  }
  const jumper = {
    id: "jumper",
    type: "Player",
    position: v(100, 40, 0),
    size: v(10, 10, 0),
    collisions: { hitbox: { shape: "rectangle" } },
  }

  const entities = { ground, platform, jumper }

  const standsOn = () => findCollision(jumper, entities)

  // Well clear of the platform, which spans y [0, 16].
  jumper.position = v(100, 40, 0)
  expect(standsOn()).toBeUndefined()

  // Resting on it: the jumper spans y [16, 26].
  jumper.position = v(100, 21, 0)
  expect(standsOn()?.id).toBe("platform")

  // A pixel higher and it clears the platform again.
  jumper.position = v(100, 22, 0)
  expect(standsOn()).toBeUndefined()

  // Beside the platform, but at the same height.
  jumper.position = v(200, 21, 0)
  expect(standsOn()).toBeUndefined()
})

test("anchoring should not change what a centred box collides with", () => {
  const target = {
    id: "target",
    position: v(100, 100, 0),
    size: v(40, 40, 0),
    collisions: { hitbox: { shape: "rectangle" } },
  }
  const probe = (position) => ({
    position,
    size: v(10, 10, 0),
    collisions: { hitbox: { shape: "rectangle" } },
  })

  const hits = [v(75, 100, 0), v(125, 100, 0), v(100, 75, 0), v(100, 125, 0)]

  hits.forEach((position) => {
    const centred = collidesWith(probe(position), target, "hitbox")
    const anchored = collidesWith(
      { ...probe(position), anchor: [0.5, 0.5] },
      { ...target, anchor: [0.5, 0.5] },
      "hitbox",
    )

    expect(anchored).toBe(centred)
  })
})
