import type { Kinematic, Steering, SteeringTarget } from "../../../index"

/** Turns to face the target. */
export function face<TEntity extends Kinematic>(
  entity: TEntity,
  target: Pick<SteeringTarget, "position">,
  dt: number,
  options?: { targetRadius?: number; timeToTarget?: number },
): Steering<TEntity, { orientation: number }>
