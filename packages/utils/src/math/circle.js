/**
 * @typedef {import("../../types/math/point").PointInput} PointInput
 * @typedef {import("../../types/math/circle").Circle} Circle
 * @typedef {import("../../types/math/rectangle").Rectangle} Rectangle
 */

import { intersectsCircle as pointIntersectsCircle } from "./point.js"
import { hypothenuse } from "./triangle.js"
import { clamp, subtract } from "./vectors.js"

const HALF = 2
const SQUARED = 2
const INITIAL_SUM = 0

/**
 * Checks if a circle intersects with a point.
 * @param {Circle} circle - The circle to check.
 * @param {PointInput} point - The point to check.
 * @returns {boolean} True if the point intersects the circle, false otherwise.
 */
export function intersectsPoint(circle, point) {
  return pointIntersectsCircle(point, circle)
}

/**
 * Checks if two circles intersect.
 * @param {Circle} circle1 - The first circle.
 * @param {Circle} circle2 - The second circle.
 * @returns {boolean} True if the circles intersect, false otherwise.
 */
export function intersectsCircle(circle1, circle2) {
  return (
    hypothenuse(...subtract(circle1.position, circle2.position)) <=
    circle1.radius + circle2.radius
  )
}

/**
 * Checks if a circle intersects with a rectangle.
 * @param {Circle} circle - The circle to check.
 * @param {Rectangle} rectangle - The rectangle to check.
 * @returns {boolean} True if the circle intersects the rectangle, false otherwise.
 */
export function intersectsRectangle(circle, rectangle) {
  const [rectX, rectY, rectZ] = rectangle.position
  const [width, height, depth] = rectangle.size

  const left = rectX - width / HALF
  const right = rectX + width / HALF
  const bottom = rectY - height / HALF
  const top = rectY + height / HALF
  const back = rectZ - depth / HALF
  const front = rectZ + depth / HALF

  const closestPoint = clamp(
    circle.position,
    [left, bottom, back],
    [right, top, front],
  )

  const distanceSquared = subtract(circle.position, closestPoint).reduce(
    (sum, value) => sum + value ** SQUARED,
    INITIAL_SUM,
  )

  return distanceSquared <= circle.radius ** SQUARED
}
