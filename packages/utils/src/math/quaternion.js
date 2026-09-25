/**
 * @typedef {import("../../types/math/vector").Vector3} Vector3
 * @typedef {import("../../types/math/quaternion").Quaternion} Quaternion
 */

import { v } from "../v.js"
import { cos, sin } from "./trigonometry.js"

const DEFAULT_ANGLE = 0
const HALF = 2 // Constant representing the divisor for halving an angle.
// eslint-disable-next-line no-magic-numbers
const Y_AXIS = v(0, 1, 0) // Default axis of rotation (Y-axis).

/**
 * Computes a quaternion representing a rotation around a given axis.
 * @param {number} [angle=0] - The angle of rotation in radians. Defaults to 0.
 * @param {Vector3} [axis=Y_AXIS] - The axis of rotation as a 3D vector Defaults to the Y-axis.
 * @returns {Quaternion} The quaternion as an array [w, x, y, z].
 */
export function quaternion(angle = DEFAULT_ANGLE, axis = Y_AXIS) {
  return v(cos(angle / HALF), ...axis.map((coord) => coord * sin(angle / HALF)))
}
