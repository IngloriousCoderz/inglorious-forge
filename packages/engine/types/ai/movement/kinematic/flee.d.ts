import type {
  Kinematic,
  KinematicMovement,
  Steering,
  SteeringTarget,
} from "../../../index"

/** Runs from the target at `maxSpeed`. */
export function flee<TEntity extends Kinematic>(
  entity: TEntity,
  target: Pick<SteeringTarget, "position">,
  dt: number,
): Steering<TEntity, KinematicMovement>
