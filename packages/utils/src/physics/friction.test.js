import { expect, test } from "vitest"

import { zero } from "../math/vector.js"
import { v } from "../v.js"
import { applyFriction } from "./friction.js"

test("it should apply friction to some velocity", () => {
  const velocity = v(8, 0, 6)
  const friction = 5
  const expectedResult = v(4, 0, 3)

  expect(applyFriction({ velocity, friction })).toStrictEqual(expectedResult)
})

test("it should stop movement when friction is equal to velocity", () => {
  const velocity = v(8, 0, 6)
  const friction = 5
  const dt = 2

  expect(applyFriction({ velocity, friction }, dt)).toStrictEqual(zero())
})

test("it should apply no friction on no velocity", () => {
  const velocity = zero()
  const friction = 5

  expect(applyFriction({ velocity, friction })).toBe(velocity)
})

test("it should apply no friction if no friction is passed", () => {
  const velocity = v(8, 0, 6)
  const friction = 0

  expect(applyFriction({ velocity, friction })).toStrictEqual(velocity)
})

test("it should apply no friction if no time passed", () => {
  const velocity = v(8, 0, 6)
  const friction = 5
  const dt = 0

  expect(applyFriction({ velocity, friction }, dt)).toStrictEqual(velocity)
})
