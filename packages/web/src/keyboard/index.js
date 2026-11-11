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

/**
 * Tells the page how much of it the on-screen keyboard covers, so what sits at
 * the bottom of the screen can move above it. Phones don't shrink the page for
 * the keyboard (iOS, and Chrome on Android): a bottom sheet or a snackbar ends
 * up behind it. This sets `--iw-keyboard-height` on `<html>`, and the
 * `iw-keyboard-open` class while the keyboard is up, from the visual viewport:
 * no plugin needed, in a browser or a native app. Where the page does shrink,
 * the height stays 0. Inglorious UI's sheets, snackbars and toasts follow it,
 * and its bottom navigation hides.
 *
 * @returns {() => void} Stops following.
 *
 * @example
 * watchKeyboard()
 */
export function watchKeyboard() {
  const viewport = window.visualViewport
  if (!viewport) return () => {}

  const root = document.documentElement
  let current = NONE

  const update = () => {
    const covered = Math.round(
      window.innerHeight - viewport.height - viewport.offsetTop,
    )
    const isKeyboard =
      covered >= MIN_KEYBOARD_PX &&
      (Boolean(current) || isEditable(document.activeElement))
    const height = isKeyboard ? covered : NONE
    if (height === current) return

    const isOpening = !current && height
    current = height
    root.style.setProperty(HEIGHT, `${height}px`)
    root.classList.toggle(OPEN, Boolean(height))
    if (isOpening) {
      requestAnimationFrame(() =>
        document.activeElement?.scrollIntoView?.({ block: "nearest" }),
      )
    }
  }

  // Not on focus changes: a tap on a button would move it before its click.
  viewport.addEventListener("resize", update)
  viewport.addEventListener("scroll", update)

  return function stop() {
    viewport.removeEventListener("resize", update)
    viewport.removeEventListener("scroll", update)
    root.style.removeProperty(HEIGHT)
    root.classList.remove(OPEN)
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
