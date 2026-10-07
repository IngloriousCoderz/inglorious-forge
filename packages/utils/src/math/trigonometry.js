import { mod } from "./number.js"

const HALF_CIRCLE_IN_DEGRESS = 180 // Half-circle in degrees (180°)
const FULL_CIRCLE = 2 // Full circle multiplier for radians (2π)

/**
 * Calculates the arctangent of the quotient of its arguments.
 * @param {number} y - The y-coordinate.
 * @param {number} x - The x-coordinate.
 * @returns {number} The angle in radians.
 */
export function atan2(y, x) {
  return Math.atan2(y, x)
}

/**
 * Calculates the cosine of an angle.
 * @param {number} angle - The angle in radians.
 * @returns {number} The cosine of the angle.
 */
export function cos(angle) {
  return Math.cos(angle)
}

/**
 * Alias for the `cos` function.
 * @type {typeof cos}.
 */
export const cosine = cos

/**
 * Returns the value of π (pi).
 * @returns {number} The value of π.
 */
export function pi() {
  return Math.PI
}

/**
 * Calculates the sine of an angle.
 * @param {number} angle - The angle in radians.
 * @returns {number} The sine of the angle.
 */
export function sin(angle) {
  return Math.sin(angle)
}

/**
 * Alias for the `sin` function.
 * @type {typeof sin}.
 */
export const sine = sin

/**
 * Converts an angle from radians to degrees.
 * @param {number} radians - The angle in radians.
 * @returns {number} The angle in degrees.
 */
export function toDegrees(radians) {
  return (radians * HALF_CIRCLE_IN_DEGRESS) / pi()
}

/**
 * Converts an angle from degrees to radians.
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in radians.
 */
export function toRadians(degrees) {
  return (degrees * pi()) / HALF_CIRCLE_IN_DEGRESS
}

/**
 * Normalizes an angle to the range [-π, π].
 * @param {number} angle - The angle in radians.
 * @returns {number} The normalized angle in radians.
 */
export function toRange(angle) {
  if (angle > -pi() && angle < pi()) {
    return angle
  }

  angle = mod(angle, FULL_CIRCLE * pi())

  if (angle > pi()) {
    angle -= FULL_CIRCLE * pi()
  }

  return angle
}
