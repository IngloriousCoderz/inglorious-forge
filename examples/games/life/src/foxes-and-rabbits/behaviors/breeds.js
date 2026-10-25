import { random } from "@inglorious/utils/math/rng"

import { getAvailableNeighbors } from "../index.js"
import { createAnimal } from "../index.js"

/**
 * Breeds an animal once it is old enough, if the dice agree and there is room.
 *
 * The rules are handed in rather than reached for, because they are something a player
 * can change while the world is running.
 *
 * @param {Object} grid - The board the animals stand on.
 * @param {Object} rules - The numbers this world is living by.
 */
export function breeds(grid, rules) {
  return (type) => ({
    tick(entity, elapsed, api) {
      type.tick?.(entity, elapsed, api)

      if (entity.isDying) {
        return
      }

      const species = rules[entity.type]

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

        const animal = createAnimal(grid, entity.type, row, column, rules)

        if (animal) {
          api.notify("add", animal)
        }

        remaining -= 1
      }
    },
  })
}
