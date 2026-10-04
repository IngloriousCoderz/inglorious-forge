/**
 * @typedef {import("../../types/math/segment").Segment} Segment
 * @typedef {import("../../types/math/point").Point} Point
 * @typedef {import("../../types/math/circle").Circle} Circle
 */

import {
  distance,
  dot,
  magnitude,
  setMagnitude,
  subtract,
  sum,
} from "./vectors.js"

const BEFORE_SEGMENT = 0

/**
 * Calculates the coefficients [a, b, c] of the line equation ax + bz + c = 0
 * for a given segment in 2D space.
 * @param {Segment} segment - The segment defined by its start (`from`) and end (`to`) points.
 * @returns {[number, number, number]} An array [a, b, c] representing the line equation.
 */
export function coefficients(segment) {
  const [x1, , z1] = segment.from
  const [x2, , z2] = segment.to
  return [z1 - z2, x2 - x1, (x1 - x2) * z1 + x1 * (z2 - z1)]
}

/**
 * Finds the closest point on a segment to a given point in 3D space.
 * @param {Segment} segment - The segment defined by its start (`from`) and end (`to`) points.
 * @param {Point} point - The point in 3D space represented as [x, y, z].
 * @returns {Point} The closest point on the segment to the given point.
 */
export function closestPoint(segment, point) {
  const shiftedSegment = subtract(segment.to, segment.from)
  const shiftedPoint = subtract(point, segment.from)

  const projectionLength =
    dot(shiftedSegment, shiftedPoint) / magnitude(shiftedSegment)

  if (projectionLength < BEFORE_SEGMENT) {
    return segment.from
  }

  if (projectionLength > magnitude(shiftedSegment)) {
    return segment.to
  }

  const projectedPoint = setMagnitude(shiftedSegment, projectionLength)
  return sum(segment.from, projectedPoint)
}

/**
 * Calculates the shortest distance from a point to a segment in 3D space.
 * @param {Segment} segment - The segment defined by its start (`from`) and end (`to`) points.
 * @param {Point} point - The point in 3D space represented as [x, y, z].
 * @returns {number} The shortest distance from the point to the segment.
 */
export function distanceFromPoint(segment, point) {
  const closest = closestPoint(segment, point)
  return distance(point, closest)
}

/**
 * Determines whether a segment intersects with the perimeter of a circle.
 * @param {Segment} segment - The segment defined by its start (`from`) and end (`to`) points.
 * @param {Circle} circle - The circle defined by its position (center) and radius.
 * @returns {boolean} `true` if the segment intersects the circle's perimeter, otherwise `false`.
 */
export function intersectsCircle(segment, circle) {
  return distanceFromPoint(segment, circle.position) <= circle.radius
}
