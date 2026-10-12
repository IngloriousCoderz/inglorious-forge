import { findAdjacentRabbit } from "../index.js"

/**
 * A fox eats a rabbit standing beside it, and grows stronger for the meal.
 *
 * The rules are handed in rather than reached for, because what a rabbit is worth is
 * something a player can change while the world is running.
 *
 * @param {Object} grid - The board the animals stand on.
 * @param {Object} rules - The numbers this world is living by.
 */
export function eats(grid, rules) {
  return (type) => ({
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      if (entity.isDying) {
        return
      }

      const prey = findAdjacentRabbit(entity, grid, api)

      if (prey) {
        api.notify(`#${prey.id}:eaten`, prey.id)
        entity.energy += rules.Fox.energyGain
      }
    },
  })
}
