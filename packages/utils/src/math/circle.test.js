import { expect, test } from "vitest"

import { v } from "../v.js"
import {
  intersectsCircle,
  intersectsPoint,
  intersectsRectangle,
} from "./circle.js"

test("it should prove that a circle around a point intersects with it", () => {
  const circle = {
    position: v(1, 1, 0),
    radius: 1,
  }
  const point = v(1.5, 1.5, 0)

  expect(intersectsPoint(circle, point)).toBe(true)
})

test("it should prove that two equal circles intersect", () => {
  const circle1 = { position: v(1, 1, 0), radius: 1 }
  const circle2 = { position: v(1, 1, 0), radius: 1 }

  expect(intersectsCircle(circle1, circle2)).toBe(true)
})

test("it should prove that two circles shifted by a small x intersect", () => {
  const circle1 = { position: v(1, 1, 0), radius: 1 }
  const circle2 = { position: v(2, 1, 0), radius: 1 }

  expect(intersectsCircle(circle1, circle2)).toBe(true)
})

test("it should prove that two touching circles intersect", () => {
  const circle1 = { position: v(1, 1, 0), radius: 1 }
  const circle2 = { position: v(3, 1, 0), radius: 1 }

  expect(intersectsCircle(circle1, circle2)).toBe(true)
})

test("it should prove that two non-touching circles do not intersect", () => {
  const circle1 = { position: v(1, 1, 0), radius: 1 }
  const circle2 = { position: v(4, 1, 0), radius: 1 }

  expect(intersectsCircle(circle1, circle2)).toBe(false)
})

test("it should prove that a circle inside of a rectangle intersects with it", () => {
  const circle = {
    position: v(1, 1, 0),
    radius: 1,
  }
  const rectangle = {
    position: v(-1, -1, 0),
    size: v(4, 4, 0),
  }

  expect(intersectsRectangle(circle, rectangle)).toBe(true)
})

test("it should prove that a circle touching the border of a rectangle intersects with it", () => {
  const circle = {
    position: v(1, 1, 0),
    radius: 1,
  }
  const rectangle = {
    position: v(-1, 1, 0),
    size: v(2, 2, 0),
  }

  expect(intersectsRectangle(circle, rectangle)).toBe(true)
})

test("it should prove that a circle crossing a rectangle intersects with it", () => {
  const circle = {
    position: v(1, 1, 0),
    radius: 1,
  }
  const rectangle = {
    position: v(0, 0, 0),
    size: v(2, 2, 0),
  }

  expect(intersectsRectangle(circle, rectangle)).toBe(true)
})

test("it should prove that a circle outside of a rectangle does not intersect with it", () => {
  const circle = {
    position: v(1, 1, 0),
    radius: 1,
  }
  const rectangle = {
    position: v(-3, 0, 0),
    size: v(2, 2, 0),
  }

  expect(intersectsRectangle(circle, rectangle)).toBe(false)
})
