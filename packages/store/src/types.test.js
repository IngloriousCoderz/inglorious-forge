import { expect, test } from "vitest"

import { augmentType, augmentTypes } from "./types.js"

test("should handle a single behavior object (mixin)", () => {
  const behavior = { onFire: () => "bang" }
  const result = augmentType(behavior)

  expect(result).toStrictEqual(behavior)
  // Ensure it's a new object, not the same reference
  expect(result).not.toBe(behavior)
})

test("should compose an array of behavior objects (mixins)", () => {
  const behavior1 = { onFire: () => "bang", onMove: () => "vroom" }
  const behavior2 = { onJump: () => "boing", onFire: () => "pow" } // onFire overwrites
  const result = augmentType([behavior1, behavior2])

  expect(result).toHaveProperty("onMove")
  expect(result).toHaveProperty("onJump")
  expect(result).toHaveProperty("onFire")
  expect(result.onFire()).toBe("pow")
})

test("should handle a single behavior function", () => {
  const behavior = (type) => ({ ...type, onJump: () => "boing" })
  const result = augmentType(behavior)

  expect(result).toHaveProperty("onJump")
  expect(result.onJump()).toBe("boing")
})

test("should compose an array of behavior functions (pipe)", () => {
  const behavior1 = (type) => ({ ...type, onMove: () => "vroom" })
  const behavior2 = (type) => ({ ...type, onJump: () => "boing" })
  const result = augmentType([behavior1, behavior2])

  expect(result).toHaveProperty("onMove")
  expect(result).toHaveProperty("onJump")
  expect(result.onMove()).toBe("vroom")
  expect(result.onJump()).toBe("boing")
})

test("should compose a mixed array of objects and functions", () => {
  const mixin1 = { onFire: () => "bang" }
  const behavior1 = (type) => ({ ...type, onJump: () => "boing" })
  const mixin2 = { onMove: () => "vroom", onFire: () => "pow" } // onFire overwrites

  const result = augmentType([mixin1, behavior1, mixin2])

  expect(result).toHaveProperty("onFire")
  expect(result).toHaveProperty("onJump")
  expect(result).toHaveProperty("onMove")
  expect(result.onFire()).toBe("pow")
  expect(result.onJump()).toBe("boing")
  expect(result.onMove()).toBe("vroom")
})

test("should return an empty object for an empty array", () => {
  const result = augmentType([])
  expect(result).toStrictEqual({})
})

test("should handle undefined or null input gracefully", () => {
  expect(augmentType(undefined)).toStrictEqual({})
  expect(augmentType(null)).toStrictEqual({})
})

test("should augment a map of types correctly", () => {
  const types = {
    Player: { onJump: () => "boing" },
    Enemy: [
      { onMove: () => "stomp" },
      (type) => ({ ...type, onAttack: () => "bite" }),
    ],
    Item: [],
  }

  const result = augmentTypes(types)

  expect(result.Player).toStrictEqual({ onJump: expect.any(Function) })
  expect(result.Enemy).toStrictEqual({
    onMove: expect.any(Function),
    onAttack: expect.any(Function),
  })
  expect(result.Item).toStrictEqual({})
})
