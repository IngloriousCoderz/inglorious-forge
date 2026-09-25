/**
 * @typedef {import("../../types/math/circle").Circle} Circle
 * @typedef {import("../../types/math/point").PointInput} PointInput
 * @typedef {import("../../types/math/rectangle").Rectangle} Rectangle
 */

import { intersectsRectangle as circleIntersectsRectangle } from "./circle.js"
import { intersectsRectangle as pointIntersectsRectangle } from "./point.js"

const HALF = 2

/**
 * Checks if a rectangle intersects with a point.
 * @param {Rectangle} rectangle - The rectangle to check.
 * @param {PointInput} point - The point to check.
 * @returns {boolean} True if the point intersects the circle, false otherwise.
 */
export function intersectsPoint(rectangle, point) {
  return pointIntersectsRectangle(point, rectangle)
}

/**
 * Checks if a rectangle intersects with a circle.
 * @param {Rectangle} rectangle - The rectangle to check.
 * @param {Circle} circle - The circle to check.
 * @returns {boolean} True if the rectangle intersects the circle, false otherwise.
 */
export function intersectsCircle(rectangle, circle) {
  return circleIntersectsRectangle(circle, rectangle)
}

/**
 * Determines whether a rectangle intersects another in 3D space.
 * @param {Rectangle} rectangle1 - The first rectangle, defined by its position (x, y, z) and size (width, height, depth).
 * @param {Rectangle} rectangle2 - The second rectangle, defined by its position (x, y, z) and size (width, height, depth).
 * @returns {boolean} True if the two rectangles intersect, false otherwise.
 */
export function intersectsRectangle(rectangle1, rectangle2) {
  const [x1, y1, z1] = rectangle1.position
  const [w1, h1, d1] = rectangle1.size
  const halfW1 = w1 / HALF
  const halfH1 = h1 / HALF
  const halfD1 = d1 / HALF

  const left1 = x1 - halfW1
  const right1 = x1 + halfW1
  const bottom1 = y1 - halfH1
  const top1 = y1 + halfH1
  const back1 = z1 - halfD1
  const front1 = z1 + halfD1

  const [x2, y2, z2] = rectangle2.position
  const [w2, h2, d2] = rectangle2.size
  const halfW2 = w2 / HALF
  const halfH2 = h2 / HALF
  const halfD2 = d2 / HALF

  const left2 = x2 - halfW2
  const right2 = x2 + halfW2
  const bottom2 = y2 - halfH2
  const top2 = y2 + halfH2
  const back2 = z2 - halfD2
  const front2 = z2 + halfD2

  // AABB intersection test
  return (
    left1 <= right2 &&
    right1 >= left2 &&
    bottom1 <= top2 &&
    top1 >= bottom2 &&
    back1 <= front2 &&
    front1 >= back2
  )
}
