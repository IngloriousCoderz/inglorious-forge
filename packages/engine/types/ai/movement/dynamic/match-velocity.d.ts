import type { DynamicMovement, Kinematic } from "../../../index"

export const DEFAULT_TIME_TO_TARGET: number

/** Accelerates to the target's velocity. */
export function matchVelocity(
  entity: Kinematic,
  target: { velocity: import("@inglorious/utils/vector.js").Vector3 },
  dt: number,
  options?: { timeToTarget?: number },
): Required<DynamicMovement>
