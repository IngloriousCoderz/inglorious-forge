import type {
  DynamicMovement,
  Kinematic,
  Steering,
  SteeringTarget,
} from "../../../index"

/** Accelerates towards the target at `maxAcceleration`. */
export function seek<TEntity extends Kinematic>(
  entity: TEntity,
  target: Pick<SteeringTarget, "position">,
  dt: number,
): Steering<TEntity, DynamicMovement>
