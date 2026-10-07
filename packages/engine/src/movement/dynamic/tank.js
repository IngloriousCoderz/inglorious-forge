import { toRange } from "@inglorious/utils/math/trigonometry.js"
import { applyFriction } from "@inglorious/utils/physics/friction.js"
import { clamp, multiply, rotate, sum, zero } from "@inglorious/utils/vector.js"

const DEFAULT_MAX_ACCELERATION = 0
const DEFAULT_MAX_SPEED = 0
const DEFAULT_FRICTION = 0

const DEFAULT_ORIENTATION = 0

const HALF_ACCELERATION = 0.5

export function tankMove(entity, dt) {
  const maxAcceleration = entity.maxAcceleration ?? DEFAULT_MAX_ACCELERATION
  const maxSpeed = entity.maxSpeed ?? DEFAULT_MAX_SPEED
  const friction = entity.friction ?? DEFAULT_FRICTION

  let orientation = entity.orientation ?? DEFAULT_ORIENTATION
  orientation = toRange(orientation)

  let acceleration = entity.acceleration ?? zero()
  acceleration = rotate(acceleration, orientation)
  acceleration = clamp(acceleration, -maxAcceleration, maxAcceleration)

  let velocity = entity.velocity ?? zero()
  velocity = sum(velocity, multiply(acceleration, dt))
  velocity = clamp(velocity, -maxSpeed, maxSpeed)
  velocity = applyFriction({ velocity, friction }, dt)

  const position = sum(
    entity.position,
    multiply(velocity, dt),
    multiply(acceleration, HALF_ACCELERATION * dt * dt),
  )

  return { velocity, position, orientation }
}
