import { seek } from "@inglorious/engine/ai/movement/dynamic/seek.js"
import {
  magnitude,
  multiply,
  subtract,
  sum,
  zero,
} from "@inglorious/utils/vectors.js"

export const DEFAULT_MAX_PREDICTION = 10

export function pursue(
  entity,
  target,
  dt,
  { maxPrediction = DEFAULT_MAX_PREDICTION } = {},
) {
  const velocity = entity.velocity ?? zero()

  const direction = subtract(target.position, entity.position)
  const distance = magnitude(direction)

  if (!distance) {
    return entity
  }

  const speed = magnitude(velocity)

  let prediction
  if (speed <= distance / maxPrediction) {
    prediction = maxPrediction
  } else {
    prediction = distance / speed
  }

  const position = sum(target.position, multiply(target.velocity, prediction))

  return seek(entity, { ...target, position }, dt)
}
