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
 * keyboardChar(entity, { character }) {
 *   entity.name += character
 * }
 * ```
 */
export function keyboard() {
  let handleKeyDown, handleKeyUp

  // What each key that is currently down was pressed as.
  const pressedAs = {}
  let currentDocument = null

  function detach() {
    currentDocument?.removeEventListener("keydown", handleKeyDown)
    currentDocument?.removeEventListener("keyup", handleKeyUp)
  }

  return {
    create(entity, payload, api) {
      currentDocument = document.body.ownerDocument || document

      handleKeyDown = createKeyDownHandler(api)
      handleKeyUp = createKeyUpHandler(api)

      currentDocument.addEventListener("keydown", handleKeyDown)
      currentDocument.addEventListener("keyup", handleKeyUp)
    },

    stop: detach,

    // Being taken off the world has to let go of the document the same way stopping the
    // game does. Without this an entity that is created and destroyed -- a screen's own
    // keyboard, say -- leaves its listeners behind, and the next one added means two
    // keyboards answering to the same key.
    destroy: detach,

    keyboardKeyDown(entity, keyCode, api) {
      const action = entity.mapping[keyCode]
      if (!action) return

      if (!entity[action]) {
        entity[action] = true
        api.notify("inputPress", { action })
      }

      // Remembered, because a key can still be down when the mapping it was pressed under
      // is changed under it -- and the release then has to go back to the action that was
      // pressed rather than looking it up in a mapping that no longer names it.
      pressedAs[keyCode] = action
    },

    keyboardKeyUp(entity, keyCode, api) {
      const action = pressedAs[keyCode] ?? entity.mapping[keyCode]

      delete pressedAs[keyCode]

      if (!action) return

      if (entity[action]) {
        entity[action] = false
        api.notify("inputRelease", { action })
      }
    },
  }
}

export function createKeyboardEntity(mapping = {}) {
  return { type: "Keyboard", mapping }
}

function createKeyDownHandler(api) {
  return (event) => {
    event.stopPropagation()
    api.notify("keyboardKeyDown", event.code)

    // Holding a key down arrives as further keydowns, which is what typing
    // should do.
    if (isCharacter(event.key)) {
      api.notify("keyboardChar", { character: event.key })
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
const SINGLE_CHARACTER = 1

function isCharacter(key) {
  return typeof key === "string" && key.length === SINGLE_CHARACTER
}
