import type { DynamicMovement, Kinematic, Steering } from "../../../index"

export const DEFAULT_WANDER_OFFSET: number
export const DEFAULT_WANDER_RADIUS: number

/** Seeks a random point on a circle `wanderOffset` ahead. */
export function wander<TEntity extends Kinematic>(
  entity: TEntity,
  dt: number,
  options?: { wanderOffset?: number; wanderRadius?: number },
): Steering<TEntity, DynamicMovement>
