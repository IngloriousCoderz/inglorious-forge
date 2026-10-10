import { SPECIES } from "../constants.js"
import { findAdjacentRabbit } from "../index.js"

export function eats(grid) {
  return (type) => ({
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      if (entity.isDying) {
        return
      }

      const prey = findAdjacentRabbit(entity, grid, api)

      if (prey) {
        api.notify(`#${prey.id}:eaten`, prey.id)
        entity.energy += SPECIES.Fox.energyGain
      }
    },
  })
}
