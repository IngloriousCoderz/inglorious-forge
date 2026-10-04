/**
 * Reports keys by their physical code, and the characters they produce.
 *
 * Actions are mapped by `code`, which is the physical key: that keeps WASD on the
 * same fingers whatever layout is installed. Typing needs `key` instead, which is
 * the character the press produced and so differs per layout and per Shift. Both
 * are notified, so `keyboardKeyDown` stays layout-independent while
 * `keyboardChar` carries something you can put in a field.
 *
 * @example
 * ```js
 * // Acting on a key, by position.
 * const actions = { KeyW: "moveUp", Space: "press" }
 *
 * // Typing, by character.
 * keyboardChar(entity, { targetId, character }) {
 *   if (targetId !== entity.targetId) return
 *   entity.name += character
 * }
 * ```
 */
export function keyboard() {
  let handleKeyDown, handleKeyUp
  let currentDocument = null

  return {
    create(entity, payload, api) {
      currentDocument = document.body.ownerDocument || document

      handleKeyDown = createKeyDownHandler(entity.targetId, api)
      handleKeyUp = createKeyUpHandler(api)

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

export function createKeyboardEntity(targetId, mapping = {}) {
  return { type: "Keyboard", targetId, mapping }
}

function createKeyDownHandler(targetId, api) {
  return (event) => {
    event.stopPropagation()
    api.notify("keyboardKeyDown", event.code)

    // Holding a key down arrives as further keydowns, which is what typing
    // should do.
    if (isCharacter(event.key)) {
      api.notify("keyboardChar", { targetId, character: event.key })
    }
  }
}

function createKeyUpHandler(api) {
  return (event) => {
    event.stopPropagation()
    api.notify("keyboardKeyUp", event.code)
  }
}

// Anything that is not a single printable character carries a word instead:
// modifiers, navigation and function keys among them.
function isCharacter(key) {
  return typeof key === "string" && key.length === 1
}
