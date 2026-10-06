import {
  angle,
  clamp,
  magnitude,
  multiply,
  setMagnitude,
  subtract,
  sum,
  zero,
} from "@inglorious/utils/vectors.js"

const DEFAULT_MAX_ACCELERATION = 0
const DEFAULT_MAX_SPEED = 0

const MIN_SPEED = 0

const HALF_ACCELERATION = 0.5

export function flee(entity, target, dt) {
  const maxAcceleration = entity.maxAcceleration ?? DEFAULT_MAX_ACCELERATION
  const maxSpeed = entity.maxSpeed ?? DEFAULT_MAX_SPEED

  let velocity = entity.velocity ?? zero()

  const direction = subtract(entity.position, target.position)
  const distance = magnitude(direction)

  if (!distance) {
    return entity
  }

  const acceleration = setMagnitude(direction, maxAcceleration)

  velocity = sum(velocity, multiply(acceleration, dt))
  velocity = clamp(velocity, MIN_SPEED, maxSpeed)

  const position = sum(
    entity.position,
    multiply(velocity, dt),
    multiply(acceleration, HALF_ACCELERATION * dt * dt),
  )

  const orientation = angle(velocity)

  return { velocity, position, orientation }
}
