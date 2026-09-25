/**
 * @typedef {import("../../types/math/vector").Vector3} Vector3
 */

import { clamp, multiply, zero } from "../math/vector.js"
import { sum } from "../math/vectors.js"
import { applyFriction } from "./friction.js"

const DEFAULT_DT = 1 // Default time delta for the applyAcceleration function.
const NO_FRICTION = 0 // No friction constant.
const HALF_ACCELERATION = 0.5 // Half of the acceleration factor used in position calculation.

/**
 * Applies acceleration to an object using Euler's integration method.
 *
 * Euler's Integration:
 * 1. v += a * dt
 * 2. p += v * dt + 1/2 * a * dt * dt
 *
 * @param {Object} params - The parameters for the function.
 * @param {number} params.maxAcceleration - The maximum allowed acceleration.
 * @param {number} params.maxSpeed - The maximum allowed speed.
 * @param {Vector3} [params.acceleration] - The current acceleration vector. Defaults to a zero vector.
 * @param {Vector3} [params.velocity] - The current velocity vector. Defaults to a zero vector.
 * @param {Vector3} [params.position] - The current position vector. Defaults to a zero vector.
 * @param {number} params.friction - The friction coefficient. Defaults to 0.
 * @param {number} dt - The time delta for the calculation. Defaults to 0.
 * @returns {Object} - The updated acceleration, velocity, and position.
 */
export function applyAcceleration(params, dt = DEFAULT_DT) {
  let {
    maxAcceleration,
    maxSpeed,
    acceleration = zero(),
    velocity = zero(),
    position = zero(),
    friction = NO_FRICTION,
  } = params

  // Clamp acceleration to the maximum allowed range
  acceleration = clamp(acceleration, -maxAcceleration, maxAcceleration)

  // Update velocity with acceleration and clamp to the maximum allowed speed
  velocity = sum(velocity, multiply(acceleration, dt))
  velocity = clamp(velocity, -maxSpeed, maxSpeed)
  velocity = applyFriction({ velocity, friction }, dt)

  // Update position with velocity and acceleration
  position = sum(
    position,
    multiply(velocity, dt),
    multiply(acceleration, HALF_ACCELERATION * dt * dt),
  )

  return { acceleration, velocity, position }
}
