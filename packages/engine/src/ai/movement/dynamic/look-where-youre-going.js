import { angle, magnitude, zero } from "@inglorious/utils/vector.js"

import { align } from "./align.js"

export function lookWhereYoureGoing(entity, dt, options) {
  const velocity = entity.velocity ?? zero()

  if (!magnitude(velocity)) {
    return entity
  }

  return align(entity, { orientation: angle(velocity) }, dt, options)
}
