import type {
  Kinematic,
  KinematicMovement,
  Steering,
  SteeringTarget,
} from "../../../index"

/** Heads for the target at `maxSpeed`. */
export function seek<TEntity extends Kinematic>(
  entity: TEntity,
  target: Pick<SteeringTarget, "position">,
  dt: number,
): Steering<TEntity, KinematicMovement>
