/**
 * The numbers a player is allowed to change while the world is running.
 *
 * Said as data rather than as code, because the panel is built from this list: one
 * slider per entry, in this order, each writing back to the number it names. Adding a
 * parameter to the game is adding a line here.
 *
 * Each entry names the number by the `species` it lives under in the rules and the
 * `parameter` it is there, so that writing it back is looking it up rather than working
 * it out. `min`, `max` and `step` are what the slider is willing to sit on, and `label`
 * is what the slider says it is.
 */
export const PARAMETERS = [
  {
    species: "Fox",
    title: "Fox",
    parameters: {
      energyDecay: {
        label: "energy lost a day",
        min: 0,
        max: 5,
        step: 0.5,
      },
      energyGain: {
        label: "energy from a rabbit",
        min: 0,
        max: 12,
        step: 0.5,
      },
      initialEnergy: {
        label: "energy at birth",
        min: 0,
        max: 10,
        step: 1,
      },
      breedingAge: { label: "breeding age", min: 1, max: 60, step: 1 },
      maxAge: { label: "old age", min: 5, max: 400, step: 5 },
      reproductionProbability: {
        label: "chance of a litter",
        min: 0,
        max: 1,
        step: 0.01,
      },
      maxLitter: { label: "litter size", min: 1, max: 8, step: 1 },
    },
  },
  {
    species: "Rabbit",
    title: "Rabbit",
    parameters: {
      breedingAge: { label: "breeding age", min: 1, max: 30, step: 1 },
      maxAge: { label: "old age", min: 5, max: 150, step: 5 },
      reproductionProbability: {
        label: "chance of a litter",
        min: 0,
        max: 1,
        step: 0.01,
      },
      maxLitter: { label: "litter size", min: 1, max: 8, step: 1 },
    },
  },
  {
    species: "start",
    title: "Starting",
    parameters: {
      fox: {
        label: "foxes",
        min: 0,
        max: 0.2,
        step: 0.005,
      },
      rabbit: {
        label: "rabbits",
        min: 0,
        max: 0.3,
        step: 0.005,
      },
    },
  },
]

/**
 * One slider per parameter, reading its starting number out of the rules.
 *
 * The value is taken rather than assumed, so a world that starts with different rules
 * still draws its sliders where its numbers are.
 *
 * @param {Object} rules - The numbers this world is living by.
 * @returns {Object[]} A slider for each parameter, in panel order.
 */
export function describeSliders(rules) {
  return PARAMETERS.flatMap(({ species, title, parameters }) =>
    Object.entries(parameters).map(([parameter, slider]) => ({
      id: `${species}-${parameter}`,
      label: `${title} ${slider.label}`,
      species,
      parameter,
      min: slider.min,
      max: slider.max,
      step: slider.step,
      value: rules[species][parameter],
    })),
  )
}
