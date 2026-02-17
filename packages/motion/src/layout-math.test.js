import { expect, test } from "vitest"

import { computeLayoutDelta, hasLayoutMovement } from "./layout-math.js"

test("computeLayoutDelta calculates translation and scale", () => {
  const fromRect = { left: 100, top: 120, width: 200, height: 100 }
  const toRect = { left: 130, top: 100, width: 100, height: 100 }

  expect(computeLayoutDelta(fromRect, toRect)).toEqual({
    deltaX: -30,
    deltaY: 20,
    scaleX: 2,
    scaleY: 1,
  })
})

test("hasLayoutMovement applies threshold", () => {
  expect(
    hasLayoutMovement({
      deltaX: 0.1,
      deltaY: 0.1,
      scaleX: 1.001,
      scaleY: 0.999,
    }),
  ).toBe(false)

  expect(
    hasLayoutMovement({ deltaX: 1.5, deltaY: 0, scaleX: 1, scaleY: 1 }),
  ).toBe(true)
})
