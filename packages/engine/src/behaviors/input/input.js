export function input() {
  return {
    inputAxis(entity, { targetId, action, value }, api) {
      if (targetId !== entity.targetId) return

      entity[action] = value

      api.notify(action, { entityId: entity.targetId, value })
    },

    inputPress(entity, { targetId, action }, api) {
      if (targetId !== entity.targetId) return

      entity[action] = true

      api.notify(action, entity.targetId)
    },

    inputRelease(entity, { targetId, action }, api) {
      if (targetId !== entity.targetId) return

      entity[action] = false

      api.notify(`${action}End`, entity.targetId)
    },
  }
}

export function createInput(targetId, mapping = {}) {
  return { type: "Input", targetId, mapping }
}
