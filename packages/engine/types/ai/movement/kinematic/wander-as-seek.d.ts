import type { Kinematic, KinematicMovement, Steering } from "../../../index"

export const DEFAULT_WANDER_RADIUS: number

/** Seeks a random point `wanderRadius` ahead. */
export function wanderAsSeek<TEntity extends Kinematic>(
  entity: TEntity,
  dt: number,
  options?: { wanderRadius?: number },
): Steering<TEntity, KinematicMovement>
