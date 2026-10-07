import {
  angle,
  clamp,
  divide,
  magnitude,
  multiply,
  subtract,
  sum,
} from "@inglorious/utils/vector.js"

export const DEFAULT_TARGET_RADIUS = 1
export const DEFAULT_TIME_TO_TARGET = 0.1

const DEFAULT_MAX_SPEED = 0

const MIN_SPEED = 0

export function arrive(
  entity,
  target,
  dt,
  {
    targetRadius = DEFAULT_TARGET_RADIUS,
    timeToTarget = DEFAULT_TIME_TO_TARGET,
  } = {},
) {
  const maxSpeed = entity.maxSpeed ?? DEFAULT_MAX_SPEED

  const direction = subtract(target.position, entity.position)
  const distance = magnitude(direction)

  if (distance < targetRadius) {
    return entity
  }

  let velocity = divide(direction, timeToTarget)
  velocity = clamp(velocity, MIN_SPEED, maxSpeed)

  const position = sum(entity.position, multiply(velocity, dt))
  const orientation = angle(velocity)

  return { velocity, position, orientation }
}
