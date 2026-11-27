import type { Kinematic, Steering } from "../../../index"

export const DEFAULT_TARGET_RADIUS: number
export const DEFAULT_TIME_TO_TARGET: number

/** Turns towards the target's orientation, at most `maxAngularSpeed`. */
export function align<TEntity extends Omit<Kinematic, "position">>(
  entity: TEntity,
  target: { orientation: number },
  dt: number,
  options?: { targetRadius?: number; timeToTarget?: number },
): Steering<TEntity, { orientation: number }>
