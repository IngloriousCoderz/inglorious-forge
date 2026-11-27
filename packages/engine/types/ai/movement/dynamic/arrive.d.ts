import type {
  DynamicMovement,
  Kinematic,
  Steering,
  SteeringTarget,
} from "../../../index"

export const DEFAULT_TARGET_RADIUS: number
export const DEFAULT_SLOW_RADIUS: number
export const DEFAULT_TIME_TO_TARGET: number

/** Accelerates towards the target, slowing within `slowRadius` to stop within `targetRadius`. */
export function arrive<TEntity extends Kinematic>(
  entity: TEntity,
  target: Pick<SteeringTarget, "position">,
  dt: number,
  options?: {
    targetRadius?: number
    slowRadius?: number
    timeToTarget?: number
  },
): Steering<TEntity, DynamicMovement>
