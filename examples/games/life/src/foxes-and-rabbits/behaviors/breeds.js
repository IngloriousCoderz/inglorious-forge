import { random } from "@inglorious/utils/math/rng"

import { SPECIES } from "../constants.js"
import { getAvailableNeighbors } from "../index.js"
import { createAnimal } from "../index.js"

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

      let remaining = random(1, species.maxLitter)

      if (grid.isFull()) {
        return
      }

      for (const [row, column] of getAvailableNeighbors(grid, [
        entity.row,
        entity.column,
      ])) {
        if (remaining === 0 || grid.isFull()) {
          return
        }

        const animal = createAnimal(grid, entity.type, row, column)

        if (animal) {
          api.notify("add", animal)
        }

        remaining -= 1
      }
    },
  })
}
