import { align } from "@inglorious/engine/ai/movement/dynamic/align.js"
import { angle, magnitude, subtract } from "@inglorious/utils/vector.js"

export function face(entity, target, dt, options) {
  const direction = subtract(target.position, entity.position)
  const distance = magnitude(direction)

  if (!distance) {
    return entity
  }

  const orientation = angle(direction)

  return align(entity, { ...target, orientation }, dt, options)
}
