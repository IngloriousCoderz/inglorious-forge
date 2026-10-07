/**
 * @typedef {import("../../types/math/vector").Vector3} Vector3
 */

import { clamp, multiply, sum, zero } from "../math/vector.js"

const DEFAULT_DT = 1 // Default time delta for the applyVelocity function.
const DEFAULT_MAX_SPEED = 0 // Default maximum speed for velocity clamping.

/**
 * Applies velocity to a position based on the given parameters and options.
 * @param {Object} params - The parameters for velocity application.
 * @param {number} [params.maxSpeed] - The maximum speed for clamping the velocity. Defaults to 0.
 * @param {Vector3} [params.velocity] - The current velocity vector. Defaults to a zero vector.
 * @param {Vector3} [params.position] - The current position vector. Defaults to a zero vector.
 * @param {number} [dt=0] - The time delta for the calculation. Defaults to 0.
 * @returns {Object} The updated velocity and position.
 */
export function applyVelocity(params, dt = DEFAULT_DT) {
  let {
    maxSpeed = DEFAULT_MAX_SPEED,
    velocity = zero(),
    position = zero(),
  } = params

  velocity = clamp(velocity, -maxSpeed, maxSpeed)

  position = sum(position, multiply(velocity, dt))
  return { velocity, position }
}
