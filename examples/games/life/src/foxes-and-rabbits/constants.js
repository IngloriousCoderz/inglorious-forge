export const FOX_INITIAL_THRESHOLD = 0.02
export const INITIAL_ANIMAL_THRESHOLD = 0.1

export const FOX_COLOR = "rgb(224, 82, 45)"
export const RABBIT_COLOR = "rgb(220, 220, 220)"

// Keyed by the name of the type, which is the same name the store knows the entity by:
// there is no constant for "Fox", because the type already says it everywhere it counts.
export const SPECIES = {
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
