import { expect, test } from "vitest"

import { v } from "../v.js"
import { findCollisions } from "./hitmask.js"

/**
 * Given a rectangle located at (x=1.5, y=0, z=2.5) with a size of (1, 1, 1),
 * which is touching a wall tile, this test proves a collision is detected.
 *
 * Tilemap layout:
 * ⬛️🟩🟩⬛️
 * ⬛️⬛️⬛️⬛️
 * ⬛️⬛️⬛️⬛️
 *
 * Rectangle position (X,Z): R at (1.5, 2.5)
 *
 * Expected outcome: true
 */
test("it should prove that a rectangle touching a wall intersects with it", () => {
  const hitmask = {
    position: v(2, 0, 1.5),
    tileSize: [1, 1],
    columns: 4,
    heights: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
  const rectangle = {
    shape: "rectangle",
    position: v(1.5, 0, 2.5),
    size: v(1, 1, 1),
  }

  expect(findCollisions(hitmask, rectangle)).toBe(true)
})

/**
 * Given the same scenario as the previous test, but all coordinates
 * are shifted by a constant value, this test proves the outcome remains
 * unchanged, ensuring the collision detection is relative.
 *
 * Tilemap layout:
 * ⬛️🟩🟩⬛️
 * ⬛️⬛️⬛️⬛️
 * ⬛️⬛️⬛️⬛️
 *
 * Rectangle position (X,Z): R at (11.5, 12.5)
 *
 * Expected outcome: true
 */
test("it should prove that shifting operands does not change the outcome", () => {
  const SHIFT = 10
  const hitmask = {
    position: [2 + SHIFT, 0, 1.5 + SHIFT],
    tileSize: [1, 1],
    columns: 4,
    heights: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
  const rectangle = {
    shape: "rectangle",
    position: v(11.5, 0, 12.5),
    size: v(1, 1, 1),
  }

  expect(findCollisions(hitmask, rectangle)).toBe(true)
})

/**
 * Given a rectangle located at (x=0.5, y=0, z=0.5) with a size of (1, 1, 1),
 * which is not touching any walls, this test proves no collision is detected.
 *
 * Tilemap layout:
 * ⬛️🟩🟩⬛️
 * ⬛️⬛️⬛️⬛️
 * ⬛️⬛️⬛️⬛️
 *
 * Rectangle position (X,Z): R at (0.5, 0.5)
 *
 * Expected outcome: false
 */
test("it should prove that a rectangle not touching a wall does not intersect with it", () => {
  const hitmask = {
    position: v(2, 0, 1.5),
    tileSize: [1, 1],
    columns: 4,
    heights: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
  const rectangle = {
    shape: "rectangle",
    position: v(0.5, 0, 0.5),
    size: v(1, 1, 1),
  }

  expect(findCollisions(hitmask, rectangle)).toBe(false)
})

/**
 * Given a rectangle located above the tile, this test proves no
 * collision is detected even when the X and Z positions overlap.
 *
 * Tilemap layout:
 * ⬛️🟩🟩⬛️
 * ⬛️⬛️⬛️⬛️
 * ⬛️⬛️⬛️⬛️
 *
 * Rectangle position: R at (x=1.5, y=1.6, z=2.5)
 *
 * Expected outcome: false
 */
test("it should prove that a rectangle above the tile of a hitmask does not intersect with it", () => {
  const hitmask = {
    position: v(2, 0, 1.5),
    tileSize: [1, 1],
    columns: 4,
    heights: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
  const rectangle = {
    shape: "rectangle",
    position: v(1.5, 1.6, 2.5),
    size: v(1, 1, 1),
  }

  expect(findCollisions(hitmask, rectangle)).toBe(false)
})

/**
 * Given a rectangle located outside of the tilemap, this test proves
 * no collision is detected.
 *
 * Tilemap layout:
 * ⬛️🟩🟩⬛️
 * ⬛️⬛️⬛️⬛️
 * ⬛️⬛️⬛️⬛️
 *
 * Rectangle position: R at (x=5.5, y=0.5, z=1.5)
 *
 * Expected outcome: false
 */
test("it should prove that a rectangle outside of a hitmask does not intersect with it", () => {
  const hitmask = {
    position: v(2, 0, 1.5),
    tileSize: [1, 1],
    columns: 4,
    heights: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
  const rectangle = {
    shape: "rectangle",
    position: v(5.5, 0.5, 1.5),
    size: v(1, 1, 1),
  }

  expect(findCollisions(hitmask, rectangle)).toBe(false)
})
