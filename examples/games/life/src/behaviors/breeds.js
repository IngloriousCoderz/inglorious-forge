import { random } from "@inglorious/utils/math/rng"

import { ONE, SPECIES, ZERO } from "../constants.js"
import { createAnimal } from "../grid.js"

export function breeds(grid) {
  return (type) => ({
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      if (entity.isDying) {
        return
      }

      const species = SPECIES[entity.type]

      if (
        entity.age < species.breedingAge ||
        random() >= species.reproductionProbability
      ) {
        return
      }

      let remaining = random(ONE, species.maxLitter)

      if (!grid.canAddAnimal()) {
        return
      }

      for (const [row, column] of grid.getAvailableNeighbors([
        entity.row,
        entity.column,
      ])) {
        if (remaining === ZERO || !grid.canAddAnimal()) {
          return
        }

        const animal = createAnimal(grid, entity.type, row, column)

        if (animal) {
          api.notify("add", animal)
        }

        remaining -= ONE
      }
    },
  })
}
