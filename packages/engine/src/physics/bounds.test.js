import { v } from "@inglorious/utils/v.js"
import { expect, test } from "vitest"

import { flip } from "./bounds.js"

const X = 0
const Z = 2

test("it should turn back from the right edge", () => {
  const entity = {
    position: v(795, 0, 300),
    size: v(20, 0, 20),
    orientation: 0,
    velocity: v(100, 0, 0),
  }

  flip(entity, v(800, 600))

  expect(Math.cos(entity.orientation)).toBeLessThan(0)
  expect(entity.velocity[X]).toBe(0)
})

test("it should turn back from the top edge", () => {
  const entity = {
    position: v(400, 0, 595),
    size: v(20, 0, 20),
    orientation: Math.PI / 2,
    velocity: v(0, 0, 100),
  }

  flip(entity, v(800, 600))

  expect(Math.sin(entity.orientation)).toBeLessThan(0)
  expect(entity.velocity[Z]).toBe(0)
})

test("it should keep its heading inside the bounds", () => {
  const entity = {
    position: v(400, 0, 300),
    size: v(20, 0, 20),
    orientation: 1,
    velocity: v(1, 0, 1),
  }

  flip(entity, v(800, 600))

  expect(entity.orientation).toBeCloseTo(1)
  expect(entity.velocity).toStrictEqual(v(1, 0, 1))
})
