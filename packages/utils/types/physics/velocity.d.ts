import type { Vector3 } from "../math"

export interface VelocityParams {
  maxSpeed?: number
  position?: Vector3
  velocity?: Vector3
}

export interface VelocityResult {
  position: Vector3
  velocity: Vector3
}

/**
 * Applies velocity to a position.
 */
export function applyVelocity(
  params: VelocityParams,
  dt?: number,
): VelocityResult
