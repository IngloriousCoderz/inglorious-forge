import { toRange } from "@inglorious/utils/math/trigonometry.js"
import {
  clamp,
  multiply,
  rotate,
  sum,
  zero,
} from "@inglorious/utils/vectors.js"

const DEFAULT_MAX_SPEED = 0

const DEFAULT_ORIENTATION = 0

export function tankMove(entity, dt) {
  const maxSpeed = entity.maxSpeed ?? DEFAULT_MAX_SPEED

  let orientation = entity.orientation ?? DEFAULT_ORIENTATION
  orientation = toRange(orientation)

  let velocity = entity.velocity ?? zero()
  velocity = rotate(velocity, orientation)
  velocity = clamp(velocity, -maxSpeed, maxSpeed)

  const position = sum(entity.position, multiply(velocity, dt))

  return { velocity, position, orientation }
}
