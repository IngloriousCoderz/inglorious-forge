/**
 * @typedef {import("../../types/math/line").Line} Line
 * @typedef {import("../../types/math/point").Point} Point
 * @typedef {import("../../types/math/circle").Circle} Circle
 */

import { abs } from "./numbers.js"
import { hypothenuse } from "./triangle.js"

/**
 * Calculates the shortest distance from a point to a line in 2D space.
 * @param {Line} line - The line represented by the equation ax + bz + c = 0, where `line` is [a, b, c].
 * @param {Point} point - The point in 3D space represented as [x, y, z].
 * @returns {number} The shortest distance from the point to the line.
 */
export function distanceFromPoint(line, point) {
  const [a, b, c] = line
  const [x, , z] = point

  return abs(a * x + b * z + c) / hypothenuse(a, b)
}

// @see https://math.stackexchange.com/questions/275529/check-if-line-intersects-with-circles-perimeter
/**
 * Determines whether a line intersects with the perimeter of a circle.
 * @param {Line} line - The line represented by the equation ax + bz + c = 0, where `line` is [a, b, c].
 * @param {Circle} circle - The circle defined by its position (center) and radius.
 * @returns {boolean} `true` if the line intersects the circle's perimeter, otherwise `false`.
 */
export function intersectsCircle(line, circle) {
  return distanceFromPoint(line, circle.position) <= circle.radius
}
