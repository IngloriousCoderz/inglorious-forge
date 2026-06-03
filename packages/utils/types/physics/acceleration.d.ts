import type { Vector3 } from "../math"

export interface AccelerationParams {
  acceleration?: Vector3
  friction?: number
  maxAcceleration: number
  maxSpeed: number
  position?: Vector3
  velocity?: Vector3
}

export interface AccelerationResult {
  acceleration: Vector3
  position: Vector3
  velocity: Vector3
}

/**
 * Applies acceleration to an object using Euler integration.
 */
export function applyAcceleration(
  params: AccelerationParams,
  dt?: number,
): AccelerationResult
