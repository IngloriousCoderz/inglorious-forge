/* eslint-disable no-magic-numbers */

const DEFAULT_MAX_JUMP = 0
const DEFAULT_MAX_LEAP = 0
const DEFAULT_MAX_SPEED = 0

/**
 * Calculates the vertical velocity (vy) of a jump
 * based on the provided parameters.
 * @param {Object} params - Parameters for the jump calculation.
 * @param {number} params.maxJump - Maximum jump height. Defaults to 0.
 * @param {number} params.maxLeap - Maximum leap distance. Defaults to 0.
 * @param {number} params.maxSpeed - Maximum speed. Defaults to 0.
 * @returns {number} The computed vertical velocity (vy).
 */
export function jump(params) {
  let {
    maxJump = DEFAULT_MAX_JUMP,
    maxLeap = DEFAULT_MAX_LEAP,
    maxSpeed = DEFAULT_MAX_SPEED,
  } = params

  const vy = (2 * maxJump * maxSpeed) / maxLeap

  return vy
}
