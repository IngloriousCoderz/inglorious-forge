import { align } from "@inglorious/engine/ai/movement/dynamic/align.js"
import { angle, magnitude, zero } from "@inglorious/utils/vectors"

export function lookWhereYoureGoing(entity, dt, options) {
  const velocity = entity.velocity ?? zero()

  if (!magnitude(velocity)) {
    return entity
  }

  return align(entity, { orientation: angle(velocity) }, dt, options)
}
