/**
 * @typedef {import("../../types/math/vectors").Vector3} Vector3
 * @typedef {import("../../types/math/quaternions").Quaternion} Quaternion
 */

import { v } from "../v.js"
import { cos, sin } from "./trigonometry.js"
import { cross, dot, multiply, sum } from "./vectors.js"

const DEFAULT_ANGLE = 0
const HALF = 2 // Constant representing the divisor for halving an angle.
// eslint-disable-next-line no-magic-numbers
const Y_AXIS = v(0, 1, 0) // Default axis of rotation (Y-axis).

/**
 * Combines two quaternions using the Hamilton product.
 * @param {Quaternion} q1 - The first quaternion.
 * @param {Quaternion} q2 - The second quaternion.
 * @returns {Quaternion} - The resulting quaternion after combining q1 and q2.
 */
export function combine(q1, q2) {
  const [s1, ...v1] = q1
  const [s2, ...v2] = q2

  return v(
    s1 * s2 - dot(v1, v2),
    ...sum(multiply(v2, s1), multiply(v1, s2), cross(v1, v2)),
  )
}

/**
 * Computes a quaternion representing a rotation around a given axis.
 * @param {number} [angle=0] - The angle of rotation in radians. Defaults to 0.
 * @param {Vector3} [axis=Y_AXIS] - The axis of rotation as a 3D vector Defaults to the Y-axis.
 * @returns {Quaternion} The quaternion as an array [w, x, y, z].
 */
export function quaternion(angle = DEFAULT_ANGLE, axis = Y_AXIS) {
  return v(cos(angle / HALF), ...axis.map((coord) => coord * sin(angle / HALF)))
}
