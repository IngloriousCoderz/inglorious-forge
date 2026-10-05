import { expect, test } from "vitest"

import { jumpable } from "./jumpable.js"

const setup = () => {
  const notify = []
  const api = { notify: (event, payload) => notify.push([event, payload]) }
  const type = jumpable({ maxJump: 10 })({})
  const entity = { position: [0, 0, 0], velocity: [0, 0, 0], jumpsLeft: 1 }

  type.create(entity, null, api)

  return { api, entity, notify, type }
}

test("it should jump when the action arrives", () => {
  const { entity, type } = setup()

  // An action's name is its address, and the notification carries nothing to compare
  // against, so a jump must not depend on an id being there.
  type.jump(entity)

  expect(entity.vy).toBeGreaterThan(0)
  expect(entity.jumpsLeft).toBe(0)
})

test("it should not jump once the jumps are used up", () => {
  const { entity, type } = setup()

  type.jump(entity)
  type.jump(entity)

  expect(entity.jumpsLeft).toBe(0)
})
