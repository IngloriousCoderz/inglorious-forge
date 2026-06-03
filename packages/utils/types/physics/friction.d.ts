import type { Vector3 } from "../math"

export interface FrictionParams {
  friction: number
  velocity?: Vector3
}

/**
 * Applies friction to a velocity vector.
 */
export function applyFriction(params: FrictionParams, dt?: number): Vector3
