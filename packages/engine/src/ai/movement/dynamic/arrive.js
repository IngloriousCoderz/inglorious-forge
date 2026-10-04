import { matchVelocity } from "@inglorious/engine/ai/movement/dynamic/match-velocity.js"
import { magnitude, setMagnitude, subtract } from "@inglorious/utils/vectors"

export const DEFAULT_TARGET_RADIUS = 1
export const DEFAULT_SLOW_RADIUS = 100
export const DEFAULT_TIME_TO_TARGET = 0.1

const DEFAULT_MAX_SPEED = 0

export function arrive(
  entity,
  target,
  dt,
  {
    targetRadius = DEFAULT_TARGET_RADIUS,
    slowRadius = DEFAULT_SLOW_RADIUS,
    timeToTarget = DEFAULT_TIME_TO_TARGET,
  } = {},
) {
  const maxSpeed = entity.maxSpeed ?? DEFAULT_MAX_SPEED

  const direction = subtract(target.position, entity.position)
  const distance = magnitude(direction)

  if (distance < targetRadius) {
    return entity
  }

  let speed
  if (distance > slowRadius) {
    speed = maxSpeed
  } else {
    speed = (distance * maxSpeed) / slowRadius
  }
  const velocity = setMagnitude(direction, speed)

  return matchVelocity(entity, { velocity }, dt, { timeToTarget })
}
