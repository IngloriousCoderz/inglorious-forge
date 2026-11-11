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
 * Tells the page when the on-screen keyboard is up, and how much of it the
 * keyboard covers, so what sits at the bottom of the screen can move above it
 * or step aside. Most phones don't shrink the page for the keyboard (iOS, and
 * Chrome on Android): a bottom sheet or a snackbar ends up behind it. This sets
 * `--iw-keyboard-height` on `<html>` from the visual viewport, and the
 * `iw-keyboard-open` class while the keyboard is up: no plugin needed, in a
 * browser or a native app. Where the page does shrink, as in an Android app,
 * the class is still set but the height stays 0, since nothing is covered.
 * Inglorious UI's sheets, snackbars and toasts follow it, and its bottom
 * navigation hides.
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
    root.style.setProperty(HEIGHT, `${height}px`)
    root.classList.toggle(OPEN, isOpen)
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
