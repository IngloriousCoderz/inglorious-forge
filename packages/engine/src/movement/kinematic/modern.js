import { applyVelocity } from "@inglorious/utils/physics/velocity.js"
import { angle, magnitude } from "@inglorious/utils/vectors.js"

const DEFAULT_ORIENTATION = 0

export function modernMove(entity, dt) {
  const { velocity, position } = applyVelocity(entity, dt)

  let orientation = entity.orientation ?? DEFAULT_ORIENTATION
  orientation = magnitude(velocity) ? angle(velocity) : orientation

  return { velocity, position, orientation }
}
