/**
 * @typedef {import("../../types/math/vector").Vector3} Vector3
 */

import { magnitude, setMagnitude, zero } from "../math/vector.js"

const DEFAULT_DT = 1 // Default time delta for the applyFriction function.
const NO_FRICTION = 0 // No friction constant.

/**
 * Applies friction to a given velocity vector.
 * @param {Object} params - The parameters for the function.
 * @param {Vector3} params.velocity - The velocity vector. Defaults to a zero vector.
 * @param {number} params.friction - The friction coefficient. Defaults to 0.
 * @param {number} dt - The time delta for the calculation. Defaults to 1.
 * @returns {Vector3} - The updated velocity vector after applying friction.
 */
export function applyFriction(params, dt = DEFAULT_DT) {
  let { velocity = zero(), friction = NO_FRICTION } = params
  const length = magnitude(velocity)

  return length ? setMagnitude(velocity, length - friction * dt) : velocity
}
