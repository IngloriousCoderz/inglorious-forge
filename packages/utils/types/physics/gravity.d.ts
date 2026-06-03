import type { Vector3 } from "../math"

export interface GravityParams {
  maxJump?: number
  maxLeap?: number
  maxSpeed?: number
  position?: Vector3
  vy?: number
}

export interface GravityResult {
  ay: number
  position: Vector3
  vy: number
}

/**
 * Applies gravity to an object based on its current velocity and position.
 */
export function applyGravity(params: GravityParams, dt?: number): GravityResult
