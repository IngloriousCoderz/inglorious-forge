import type {
  Kinematic,
  KinematicMovement,
  Steering,
  SteeringTarget,
} from "../../../index"

export const DEFAULT_TARGET_RADIUS: number
export const DEFAULT_TIME_TO_TARGET: number

/** Heads for the target, slowing down to stop within `targetRadius`. */
export function arrive<TEntity extends Kinematic>(
  entity: TEntity,
  target: Pick<SteeringTarget, "position">,
  dt: number,
  options?: { targetRadius?: number; timeToTarget?: number },
): Steering<TEntity, KinematicMovement>
