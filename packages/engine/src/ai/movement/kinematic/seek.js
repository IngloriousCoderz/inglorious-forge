import {
  angle,
  magnitude,
  multiply,
  setMagnitude,
  subtract,
  sum,
} from "@inglorious/utils/vectors"

const DEFAULT_MAX_SPEED = 0

export function seek(entity, target, dt) {
  const maxSpeed = entity.maxSpeed ?? DEFAULT_MAX_SPEED

  const direction = subtract(target.position, entity.position)
  const distance = magnitude(direction)

  if (!distance) {
    return entity
  }

  const velocity = setMagnitude(direction, maxSpeed)
  const position = sum(entity.position, multiply(velocity, dt))
  const orientation = angle(velocity)

  return { velocity, position, orientation }
}
