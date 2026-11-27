import type {
  DynamicMovement,
  Kinematic,
  Steering,
  SteeringTarget,
} from "../../../index"

export const DEFAULT_MAX_PREDICTION: number

/** Flees from where the target will be, up to `maxPrediction` seconds ahead. */
export function evade<TEntity extends Kinematic>(
  entity: TEntity,
  target: Required<Pick<SteeringTarget, "position" | "velocity">>,
  dt: number,
  options?: { maxPrediction?: number },
): Steering<TEntity, DynamicMovement>
