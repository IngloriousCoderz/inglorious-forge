import { FOX, SPECIES, ZERO } from "../constants.js"

export function aged() {
  return (type) => ({
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      if (entity.isDying) {
        return
      }

      entity.age += 1

      if (entity.type === FOX) {
        entity.energy -= SPECIES[FOX].energyDecay
      }

      if (
        entity.age > SPECIES[entity.type].maxAge ||
        (entity.type === FOX && entity.energy <= ZERO)
      ) {
        entity.isDying = true
      }
    },
  })
}
