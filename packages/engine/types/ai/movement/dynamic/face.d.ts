import type { Kinematic, Steering, SteeringTarget } from "../../../index"
import type { AlignOptions } from "./align"

/** Turns to face the target. */
export function face<TEntity extends Kinematic>(
  entity: TEntity,
  target: Pick<SteeringTarget, "position">,
  dt: number,
  options?: AlignOptions,
): Steering<TEntity, { angularSpeed: number; orientation: number }>
