export function keyboard() {
  let handleKeyDown, handleKeyUp
  let currentDocument = null

  return {
    create(entity, payload, api) {
      currentDocument = document.body.ownerDocument || document

      handleKeyDown = createKeyboardHandler("keyboardKeyDown", api)
      handleKeyUp = createKeyboardHandler("keyboardKeyUp", api)

      currentDocument.addEventListener("keydown", handleKeyDown)
      currentDocument.addEventListener("keyup", handleKeyUp)
    },

    stop() {
      currentDocument.removeEventListener("keydown", handleKeyDown)
      currentDocument.removeEventListener("keyup", handleKeyUp)
    },

    keyboardKeyDown(entity, keyCode, api) {
      const action = entity.mapping[keyCode]
      if (!action) return

      if (!entity[action]) {
        entity[action] = true
        api.notify("inputPress", { targetId: entity.targetId, action })
      }
    },

    keyboardKeyUp(entity, keyCode, api) {
      const action = entity.mapping[keyCode]
      if (!action) return

      if (entity[action]) {
        entity[action] = false
        api.notify("inputRelease", { targetId: entity.targetId, action })
      }
    },
  }
}

export function createKeyboard(targetId, mapping = {}) {
  return { type: "Keyboard", targetId, mapping }
}

function createKeyboardHandler(id, api) {
  return (event) => {
    event.stopPropagation()
    api.notify(id, event.code)
  }
}
