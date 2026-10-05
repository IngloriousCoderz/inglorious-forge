const DEFAULT_ACTIONS = []

/**
 * Turns pointer gestures into input actions, the same way the keyboard and the
 * gamepad behaviors do. A click is a complete press, while a touch reports its
 * press on `touchStart` and its release on `touchEnd`.
 */
export function pointer() {
  return {
    mouseClick(entity, position, api) {
      press(entity, api)
      release(entity, api)
    },

    touchStart(entity, position, api) {
      press(entity, api)
    },

    touchEnd(entity, position, api) {
      release(entity, api)
    },
  }
}

export function createPointerEntity(actions = DEFAULT_ACTIONS) {
  return { type: "Pointer", actions }
}

function press(entity, api) {
  entity.actions.forEach((action) => {
    api.notify("inputPress", { action })
  })
}

function release(entity, api) {
  entity.actions.forEach((action) => {
    api.notify("inputRelease", { action })
  })
}
