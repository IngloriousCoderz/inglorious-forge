const HEIGHT = "--iw-keyboard-height"
const OPEN = "iw-keyboard-open"
const MIN_KEYBOARD_PX = 100
const NONE = 0
const TEXT_INPUTS = new Set([
  "text",
  "search",
  "email",
  "url",
  "tel",
  "password",
  "number",
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
])

const watches = new Map()

/**
 * The type that knows when the on-screen keyboard is up, and how much of the
 * page it covers. Most phones don't shrink the page for the keyboard (iOS, and
 * Chrome on Android): a bottom sheet or a snackbar ends up behind it. The entity
 * holds `isOpen` and `height`, read from the visual viewport, and the type sets
 * `--iw-keyboard-height` on `<html>` and the `iw-keyboard-open` class while the
 * keyboard is up, which Inglorious UI's sheets, snackbars, toasts and bottom
 * navigation follow. Where the page does shrink, as in an Android app, `isOpen`
 * is still set but `height` stays 0, since nothing is covered. No plugin is
 * needed, in a browser or a native app.
 *
 * @example
 * const types = { Keyboard }
 * const entities = { keyboard: { type: "Keyboard" } }
 */
export const Keyboard = {
  create(entity, _, api) {
    entity.isSupported = Boolean(globalThis.visualViewport)
    entity.isOpen ??= false
    entity.height ??= NONE
    if (!entity.isSupported) return

    const { id } = entity
    watches.get(id)?.()
    watches.set(
      id,
      watch((change) => api.notify(`#${id}:keyboardChange`, change)),
    )
  },

  destroy(entity) {
    watches.get(entity.id)?.()
    watches.delete(entity.id)
    const root = globalThis.document?.documentElement
    root?.style.removeProperty(HEIGHT)
    root?.classList.remove(OPEN)
  },

  keyboardChange(entity, { isOpen, height }) {
    entity.isOpen = isOpen
    entity.height = height
    apply({ isOpen, height })
  },
}

function apply({ isOpen, height }) {
  const root = globalThis.document?.documentElement
  if (!root) return
  root.style.setProperty(HEIGHT, `${height}px`)
  root.classList.toggle(OPEN, isOpen)
}

/**
 * Follows the visual viewport, calling `onChange` when the keyboard opens,
 * closes or covers a different height.
 * @param {(change: { isOpen: boolean, height: number }) => void} onChange
 * @returns {() => void} Stops following.
 */
function watch(onChange) {
  const viewport = window.visualViewport
  let isOpen = false
  let height = NONE
  let fullWidth = window.innerWidth
  let fullHeight = window.innerHeight

  const update = () => {
    if (window.innerWidth !== fullWidth) {
      fullWidth = window.innerWidth
      fullHeight = window.innerHeight
    }
    if (!isOpen) fullHeight = Math.max(fullHeight, window.innerHeight)

    const covered = Math.round(
      window.innerHeight - viewport.height - viewport.offsetTop,
    )
    const shrunk = fullHeight - window.innerHeight
    const isKeyboard =
      (covered >= MIN_KEYBOARD_PX || shrunk >= MIN_KEYBOARD_PX) &&
      (isOpen || isEditable(document.activeElement))
    const nextHeight = isKeyboard && covered >= MIN_KEYBOARD_PX ? covered : NONE
    if (isKeyboard === isOpen && nextHeight === height) return

    const isOpening = isKeyboard && !isOpen
    isOpen = isKeyboard
    height = nextHeight
    onChange({ isOpen, height })
    if (isOpening) {
      requestAnimationFrame(() =>
        document.activeElement?.scrollIntoView?.({ block: "nearest" }),
      )
    }
  }

  // Not on focus changes: a tap on a button would move it before its click.
  viewport.addEventListener("resize", update)
  viewport.addEventListener("scroll", update)
  window.addEventListener("resize", update)

  return function stop() {
    viewport.removeEventListener("resize", update)
    viewport.removeEventListener("scroll", update)
    window.removeEventListener("resize", update)
  }
}

function isEditable(element) {
  if (!element) return false
  if (element.isContentEditable) return true
  if (element.tagName === "TEXTAREA") return !element.readOnly
  if (element.tagName === "INPUT") {
    return TEXT_INPUTS.has(element.type) && !element.readOnly
  }
  return false
}
