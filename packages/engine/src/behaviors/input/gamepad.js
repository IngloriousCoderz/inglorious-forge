export function gamepadsPoller() {
  return {
    create(entity) {
      entity.gamepadStateCache ??= {}
    },

    update(entity, dt, api) {
      navigator.getGamepads().forEach((pad) => {
        if (pad == null) return

        const cache = (entity.gamepadStateCache[pad.index] ??= {
          axes: [],
          buttons: [],
        })

        pad.axes.forEach((axis, index) => {
          if (axis === cache.axes[index]) return

          api.notify("gamepadAxis", {
            axis: `Axis${index}`,
            value: axis,
          })
          cache.axes[index] = axis
        })

        pad.buttons.forEach((button, index) => {
          const wasPressed = cache.buttons[index]
          const isPressed = button.pressed

          if (isPressed && !wasPressed) {
            api.notify("gamepadPress", { button: `Btn${index}` })
          } else if (!isPressed && wasPressed) {
            api.notify("gamepadRelease", { button: `Btn${index}` })
          }

          cache.buttons[index] = isPressed
        })
      })
    },
  }
}

export function gamepad() {
  // What each button that is currently held was pressed as.
  const pressedAs = {}

  return {
    mappingChange(entity, mapping) {
      entity.mapping = mapping
    },

    gamepadAxis(entity, { axis, value }, api) {
      const action = entity.mapping[axis]
      if (!action) return

      entity[action] = value
      api.notify("inputAxis", { action, value })
    },

    gamepadPress(entity, { button }, api) {
      const action = entity.mapping[button]
      if (!action) return

      if (!entity[action]) {
        entity[action] = true
        api.notify("inputPress", { action })
      }

      // Remembered for the same reason as on the keyboard: a button can still be held
      // when the mapping it was pressed under is changed under it.
      pressedAs[button] = action
    },

    gamepadRelease(entity, { button }, api) {
      const action = pressedAs[button] ?? entity.mapping[button]

      delete pressedAs[button]

      if (!action) return

      if (entity[action]) {
        entity[action] = false
        api.notify("inputRelease", { action })
      }
    },
  }
}

export function createGamepadEntity(mapping = {}) {
  return { type: "Gamepad", mapping }
}
