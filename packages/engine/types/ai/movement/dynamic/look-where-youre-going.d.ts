import type { Kinematic, Steering } from "../../../index"
import type { AlignOptions } from "./align"

/** Turns to face where it is going. */
export function lookWhereYoureGoing<
  TEntity extends Omit<Kinematic, "position">,
>(
  entity: TEntity,
  dt: number,
  options?: AlignOptions,
): Steering<TEntity, { angularSpeed: number; orientation: number }>
