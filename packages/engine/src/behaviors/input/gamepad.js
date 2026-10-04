export function gamepadsPoller(targetIds = []) {
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
            targetId: targetIds[pad.index],
            axis: `Axis${index}`,
            value: axis,
          })
          cache.axes[index] = axis
        })

        pad.buttons.forEach((button, index) => {
          const wasPressed = cache.buttons[index]
          const isPressed = button.pressed

          if (isPressed && !wasPressed) {
            api.notify("gamepadPress", {
              targetId: targetIds[pad.index],
              button: `Btn${index}`,
            })
          } else if (!isPressed && wasPressed) {
            api.notify("gamepadRelease", {
              targetId: targetIds[pad.index],
              button: `Btn${index}`,
            })
          }

          cache.buttons[index] = isPressed
        })
      })
    },
  }
}

export function gamepad() {
  return {
    gamepadAxis(entity, { targetId, axis, value }, api) {
      if (targetId !== entity.targetId) return

      const action = entity.mapping[axis]
      if (!action) return

      entity[action] = value
      api.notify("inputAxis", { targetId, action, value })
    },

    gamepadPress(entity, { targetId, button }, api) {
      if (targetId !== entity.targetId) return

      const action = entity.mapping[button]
      if (!action) return

      if (!entity[action]) {
        entity[action] = true
        api.notify("inputPress", { targetId, action })
      }
    },

    gamepadRelease(entity, { targetId, button }, api) {
      if (targetId !== entity.targetId) return

      const action = entity.mapping[button]
      if (!action) return

      if (entity[action]) {
        entity[action] = false
        api.notify("inputRelease", { targetId, action })
      }
    },
  }
}

export function createGamepadEntity(targetId, mapping = {}) {
  return { type: "Gamepad", targetId, mapping }
}
