import {
  angle,
  clamp,
  divide,
  magnitude,
  multiply,
  subtract,
  sum,
  zero,
} from "@inglorious/utils/vectors.js"

export const DEFAULT_TIME_TO_TARGET = 0.1

const DEFAULT_MAX_ACCELERATION = 0
const DEFAULT_MAX_SPEED = 0
const DEFAULT_ORIENTATION = 0

const MIN_ACCELERATION = 0
const MIN_SPEED = 0

const HALF_ACCELERATION = 0.5

export function matchVelocity(
  entity,
  target,
  dt,
  { timeToTarget = DEFAULT_TIME_TO_TARGET } = {},
) {
  const maxAcceleration = entity.maxAcceleration ?? DEFAULT_MAX_ACCELERATION
  const maxSpeed = entity.maxSpeed ?? DEFAULT_MAX_SPEED

  let orientation = entity.orientation ?? DEFAULT_ORIENTATION

  let velocity = entity.velocity ?? zero()
  const velocityDelta = subtract(target.velocity, velocity)

  let acceleration = divide(velocityDelta, timeToTarget)
  acceleration = clamp(acceleration, MIN_ACCELERATION, maxAcceleration)

  velocity = sum(velocity, multiply(acceleration, dt))
  velocity = clamp(velocity, MIN_SPEED, maxSpeed)

  const position = sum(
    entity.position,
    multiply(velocity, dt),
    multiply(acceleration, HALF_ACCELERATION * dt * dt),
  )

  orientation = magnitude(velocity) ? angle(velocity) : orientation

  return { acceleration, velocity, position, orientation }
}
