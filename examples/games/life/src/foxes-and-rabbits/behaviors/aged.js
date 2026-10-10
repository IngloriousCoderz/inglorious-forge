import { SPECIES } from "../constants.js"

export function aged() {
  return (type) => ({
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      if (entity.isDying) {
        return
      }

      entity.age += 1

      if (entity.type === "Fox") {
        entity.energy -= SPECIES.Fox.energyDecay
      }

      if (
        entity.age > SPECIES[entity.type].maxAge ||
        (entity.type === "Fox" && entity.energy <= 0)
      ) {
        entity.isDying = true
      }
    },
  })
}
