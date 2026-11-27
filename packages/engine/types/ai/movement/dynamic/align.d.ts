import type { Kinematic, Steering } from "../../../index"

export const DEFAULT_TARGET_RADIUS: number
export const DEFAULT_SLOW_RADIUS: number
export const DEFAULT_TIME_TO_TARGET: number

export interface AlignOptions {
  targetRadius?: number
  slowRadius?: number
  timeToTarget?: number
}

/** Turns towards the target's orientation, at most `maxAngularAcceleration`. */
export function align<TEntity extends Omit<Kinematic, "position">>(
  entity: TEntity,
  target: { orientation: number },
  dt: number,
  options?: AlignOptions,
): Steering<TEntity, { angularSpeed: number; orientation: number }>
