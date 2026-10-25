/**
 * Ages every animal, and takes a fox's energy down by what a day costs it.
 *
 * The rules are handed in rather than reached for, because they are something a player
 * can change while the world is running: a behaviour that read a constant would carry
 * on ageing animals to a maximum the slider had already moved.
 *
 * @param {Object} rules - The numbers this world is living by.
 */
export function aged(rules) {
  return (type) => ({
    tick(entity, elapsed, api) {
      type.tick?.(entity, elapsed, api)

      if (entity.isDying) {
        return
      }

      const species = rules[entity.type]

      entity.age += 1

      if (entity.type === "Fox") {
        entity.energy -= species.energyDecay
      }

      if (
        entity.age > species.maxAge ||
        (entity.type === "Fox" && entity.energy <= 0)
      ) {
        entity.isDying = true
      }
    },
  })
}
