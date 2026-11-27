import { expect, test } from "vitest"

import { bouncy } from "./bouncy.js"

test("it should bounce when it lands", () => {
  const type = bouncy({ bounciness: 0.5 })({})
  const entity = {
    id: "ball",
    maxJump: 10,
    maxLeap: 100,
    maxSpeed: 250,
    groundObject: {},
  }
  type.create(entity)

  type.land(entity, { entityId: "ball", targetId: "floor" })

  expect(entity.vy).toBeGreaterThan(0)
  expect(entity.groundObject).toBeUndefined()
})

test("it should not bounce when something else lands", () => {
  const type = bouncy()({})
  const entity = { id: "ball", maxJump: 10, vy: 0 }
  type.create(entity)

  type.land(entity, { entityId: "player", targetId: "floor" })

  expect(entity.vy).toBe(0)
})
