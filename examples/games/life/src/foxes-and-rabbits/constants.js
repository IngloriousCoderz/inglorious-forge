export const FOX_COLOR = "rgb(224, 82, 45)"
export const RABBIT_COLOR = "rgb(220, 220, 220)"

/**
 * How foxes and rabbits live, and how many of them there are to begin with.
 *
 * This is a plain object rather than a set of constants because every number in it is
 * something a player is meant to be able to change while the world is running, and a
 * constant cannot be changed by anything. It is made fresh for each world by
 * `createRules`, so two of them never argue over the same numbers.
 *
 * The species are keyed by the name of the type, which is the same name the store knows
 * the entity by: there is no constant for "Fox", because the type already says it
 * everywhere it counts.
 *
 * @returns {Object} The rules one world runs on.
 */
export function createRules() {
  return {
    start: {
      fox: 0.02,
      rabbit: 0.1,
    },

    Fox: {
      initialEnergy: 2,
      energyDecay: 1,
      energyGain: 4,
      breedingAge: 10,
      maxAge: 150,
      reproductionProbability: 0.09,
      maxLitter: 3,
    },
    Rabbit: {
      initialEnergy: 0,
      energyDecay: 0,
      energyGain: 0,
      breedingAge: 5,
      maxAge: 50,
      reproductionProbability: 0.15,
      maxLitter: 5,
    },
  }
}
