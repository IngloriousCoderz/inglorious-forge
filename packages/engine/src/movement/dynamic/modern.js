import { applyAcceleration } from "@inglorious/utils/physics/acceleration.js"
import { angle, magnitude } from "@inglorious/utils/vector.js"

const DEFAULT_ORIENTATION = 0

const ORIENTATION_CHANGE_THRESHOLD = 4

export function modernMove(entity, dt) {
  const { acceleration, velocity, position } = applyAcceleration(entity, dt)

  let orientation = entity.orientation ?? DEFAULT_ORIENTATION
  orientation =
    magnitude(velocity) > ORIENTATION_CHANGE_THRESHOLD
      ? angle(velocity)
      : orientation

  return { acceleration, velocity, position, orientation }
}
