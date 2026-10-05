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
    anchor: [0, 0],
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
    image: { id: "tile", imageSize: [64, 16], anchor: [0, 0] },
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
    anchor: [0, 0],
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
    anchor: [0, 0],
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

test("a solid entity collides with its own size", () => {
  const ball = {
    position: v(100, 100, 0),
    size: v(8, 8, 0),
    solid: true,
  }
  const brick = {
    position: v(104, 100, 0),
    size: v(32, 16, 0),
    solid: true,
  }

  // Overlapping by four pixels on the x axis, which is all it takes.
  expect(findCollision(ball, { brick })).toStrictEqual(brick)
  expect(collidesWith(ball, brick)).toBe(true)
})

test("an entity that only has a size is not in the way", () => {
  const ball = {
    position: v(100, 100, 0),
    size: v(8, 8, 0),
    solid: true,
  }

  // Plenty of things have a size and are not solid: a line of text, a frame counter,
  // anything measured in pixels rather than in space.
  const label = { position: v(100, 100, 0), size: v(8, 8, 0) }

  expect(findCollision(ball, { label })).toBeUndefined()
})

test("a declared collision still wins over being solid", () => {
  const ball = {
    position: v(100, 100, 0),
    size: v(8, 8, 0),
    solid: true,
  }
  // Solid, and wide enough that its box does overlap the ball's: it spans 74 to 106
  // across, and the ball spans 96 to 104. Its hitbox is a point rather than that box
  // though, and the point sits at 90, clear of the ball, so they do not touch.
  const thin = {
    position: v(90, 100, 0),
    size: v(32, 16, 0),
    solid: true,
    collisions: { hitbox: { shape: "point" } },
  }

  expect(collidesWith(ball, thin)).toBe(false)
})

test("a collision offset moves the shape without moving the sprite", () => {
  // A square sprite is easier to draw from a corner, while a circle is easier to place
  // from its middle, so the two are pinned to the same corner and the collision is
  // pushed to where its own shape wants to be measured from.
  const half = 8
  const corner = [0, 0]

  const ball = {
    position: v(100, 100, 0),
    size: v(16, 16, 0),
    anchor: corner,
  }
  const fromCentre = {
    ...ball,
    collisions: {
      hitbox: { shape: "circle", radius: half, offset: v(half, half, 0) },
    },
  }
  const withoutOffset = {
    ...ball,
    collisions: { hitbox: { shape: "circle", radius: half } },
  }

  const ballCentre = [100 + half, 100 + half]

  // The offset puts the circle's middle where the sprite's middle is.
  expect(collidesWith(ball, fromCentre)).toBe(
    collidesWith(
      { ...ball, position: v(ballCentre[X], ballCentre[Y], 0) },
      withoutOffset,
    ),
  )
})
