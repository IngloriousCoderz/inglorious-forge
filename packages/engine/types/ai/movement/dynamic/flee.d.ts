import type {
  DynamicMovement,
  Kinematic,
  Steering,
  SteeringTarget,
} from "../../../index"

/** Accelerates away from the target at `maxAcceleration`. */
export function flee<TEntity extends Kinematic>(
  entity: TEntity,
  target: Pick<SteeringTarget, "position">,
  dt: number,
): Steering<TEntity, DynamicMovement>
