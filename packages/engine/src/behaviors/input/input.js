/**
 * Turns input actions into the events the rest of the game listens for.
 *
 * An action's name is its address: a type that handles `moveLeft` is the type that
 * answers to it. Nothing has to say who the input was for, because the names in the
 * mapping are the game's own vocabulary.
 *
 * This does not hold that vocabulary, and takes no part in changing it. What each key
 * means is a question for whoever decides it -- see `mappings`, which is the usual
 * reason -- and each device that reads a mapping is told directly, rather than being
 * reached across the world by something that should not be writing to entities other
 * than the one it was given.
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

export function createInputEntity() {
  return { type: "Input" }
}
