import { seek } from "@inglorious/engine/ai/movement/kinematic/seek.js"
import { randomBinomial } from "@inglorious/utils/math/rng.js"
import { fromAngle, multiply, sum } from "@inglorious/utils/vector.js"

export const DEFAULT_WANDER_RADIUS = 10

const DEFAULT_MAX_ANGULAR_SPEED = 0

const DEFAULT_ORIENTATION = 0

export function wanderAsSeek(
  entity,
  dt,
  { wanderRadius = DEFAULT_WANDER_RADIUS } = {},
) {
  const maxAngularSpeed = entity.maxAngularSpeed ?? DEFAULT_MAX_ANGULAR_SPEED

  let orientation = entity.orientation ?? DEFAULT_ORIENTATION
  orientation += randomBinomial() * maxAngularSpeed

  const position = sum(
    entity.position,
    multiply(fromAngle(orientation), wanderRadius),
  )

  return seek(entity, { position }, dt)
}
