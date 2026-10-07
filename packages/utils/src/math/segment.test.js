import { expect, test } from "vitest"

import { v } from "../v.js"
import { isClose } from "./number.js"
import {
  closestPoint,
  coefficients,
  distanceFromPoint,
  intersectsCircle,
} from "./segment.js"

expect.extend({
  toStrictEqualVector(received, expected) {
    const { isNot } = this
    return {
      pass: received.every((coord, index) => isClose(coord, expected[index])),
      message: () =>
        `${received} is ${isNot ? "" : "not"} close to ${expected}`,
    }
  },
})

test("it should retrieve values of *a*, *b*, and *c* from a segment, so it looks like a line in the form *ax + by + c = 0*", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(1, 0, 2),
  }
  const expectedResult = v(-2, 1, 0)

  expect(coefficients(segment)).toStrictEqual(expectedResult)
})

test("it should find the closest point in a segment to a point projectable on it", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(2, 0, 2),
  }
  const point = v(2, 0, 0)
  const expectedResult = v(1, 0, 1)

  expect(closestPoint(segment, point)).toStrictEqualVector(expectedResult)
})

test("it should find the closest point as the point itself when resting on the segment", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(2, 0, 2),
  }
  const point = v(1, 0, 1)
  const expectedResult = v(1, 0, 1)

  expect(closestPoint(segment, point)).toStrictEqualVector(expectedResult)
})

test("it return the start of a segment when the point is close to its start", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(3, 0, 4),
  }
  const point = v(-2, 0, 0)
  const expectedResult = v(0, 0, 0)

  expect(closestPoint(segment, point)).toStrictEqualVector(expectedResult)
})

test("it should return the end of a segment when the point is close to its end", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(3, 0, 4),
  }
  const point = v(5, 0, 4)
  const expectedResult = v(3, 0, 4)

  expect(closestPoint(segment, point)).toStrictEqualVector(expectedResult)
})

test("it should compute the distance between a segment and a point projectable on it", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(3, 0, 4),
  }
  const point = v(5, 0, 0)
  const expectedResult = 4

  expect(distanceFromPoint(segment, point)).toBe(expectedResult)
})

test("it should compute the distance between a segment and a point resting on it", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(2, 0, 2),
  }
  const point = v(1, 0, 1)
  const expectedResult = 0

  expect(distanceFromPoint(segment, point)).toBeCloseTo(expectedResult)
})

test("it should compute the distance between a segment and a point close to the start", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(3, 0, 4),
  }
  const point = v(-2, 0, 0)
  const expectedResult = 2

  expect(distanceFromPoint(segment, point)).toBe(expectedResult)
})

test("it should compute the distance between a segment and a point close to the end", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(3, 0, 4),
  }
  const point = v(5, 0, 4)
  const expectedResult = 2

  expect(distanceFromPoint(segment, point)).toBeCloseTo(expectedResult)
})

test("it should prove that a segment that crosses a circle intersects with it", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(2, 0, 2),
  }
  const circle = {
    position: v(1, 0, 1),
    radius: 1,
  }

  expect(intersectsCircle(segment, circle)).toBe(true)
})

test("it should prove that a segment tangent to a circle intersects with it", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(0, 0, 2),
  }
  const circle = {
    position: v(1, 0, 1),
    radius: 1,
  }

  expect(intersectsCircle(segment, circle)).toBe(true)
})

test("it should prove that a segment inside of a circle intersects with it", () => {
  const segment = {
    from: v(0.5, 0, 0.5),
    to: v(1.5, 0, 1.5),
  }
  const circle = {
    position: v(1, 0, 1),
    radius: 1,
  }

  expect(intersectsCircle(segment, circle)).toBe(true)
})

test("it should prove that a segment that does not cross a circle does not intersect with it", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(-2, 0, 2),
  }
  const circle = {
    position: v(1, 0, 1),
    radius: 1,
  }

  expect(intersectsCircle(segment, circle)).toBe(false)
})

test("it should prove that a segment that reaches outside of a circle does not intersect with it", () => {
  const segment = {
    from: v(0, 0, 0),
    to: v(-1, 0, -2),
  }
  const circle = {
    position: v(1, 0, 1),
    radius: 1,
  }

  expect(intersectsCircle(segment, circle)).toBe(false)
})
