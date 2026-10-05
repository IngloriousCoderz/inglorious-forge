/**
 * Turns input actions into the events the rest of the game listens for.
 *
 * An action's name is its address: a type that handles `moveLeft` is the type that
 * answers to it. Nothing has to say who the input was for, because there is only one
 * mapping and the names in it are the game's own vocabulary.
 */
export function input() {
  return {
    inputAxis(entity, { action, value }, api) {
      entity[action] = value

      api.notify(action, { value })
    },

    inputPress(entity, { action }, api) {
      entity[action] = true

      api.notify(action)
    },

    inputRelease(entity, { action }, api) {
      entity[action] = false

      api.notify(`${action}End`)
    },
  }
}

export function createInputEntity(mapping = {}) {
  return { type: "Input", mapping }
}
