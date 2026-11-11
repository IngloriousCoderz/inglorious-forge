const SHEET_QUERY = "(width < 48rem)"
const PRIMARY_BUTTON = 0
const DISMISS_SHARE = 0.3
const DISMISS_SPEED_PX_PER_MS = 0.5
const MIN_FLICK_PX = 24
const MIN_ELAPSED_MS = 1
const SLIDE_OUT_MS = 250
const INTERACTIVE = "button, a, input, select, textarea, [contenteditable]"

/**
 * Lets a bottom sheet follow the finger down from its handle or header, and
 * close when dragged past a share of its height or flicked. Called from
 * `pointerdown`; does nothing on wider screens, where the sheet is a centred
 * dialog, or when the press starts on a control.
 * @param {PointerEvent} event
 * @param {() => void} onDismiss
 */
export function dragToDismiss(event, onDismiss) {
  if (event.button !== PRIMARY_BUTTON) return
  if (event.target.closest?.(INTERACTIVE)) return
  if (!window.matchMedia?.(SHEET_QUERY).matches) return

  const handle = event.currentTarget
  const sheet = handle.closest("dialog")
  if (!sheet) return

  const startY = event.clientY
  const startTime = event.timeStamp
  let distance = 0

  handle.setPointerCapture?.(event.pointerId)
  sheet.style.transition = "none"

  const move = (moveEvent) => {
    distance = Math.max(0, moveEvent.clientY - startY)
    sheet.style.transform = distance ? `translateY(${distance}px)` : ""
  }

  const end = (endEvent) => {
    handle.removeEventListener("pointermove", move)
    handle.removeEventListener("pointerup", end)
    handle.removeEventListener("pointercancel", end)
    sheet.style.transition = ""
    if (endEvent.type === "pointercancel") {
      sheet.style.transform = ""
      return
    }

    distance = Math.max(0, endEvent.clientY - startY)
    const elapsed = Math.max(endEvent.timeStamp - startTime, MIN_ELAPSED_MS)
    const isFlick =
      distance > MIN_FLICK_PX && distance / elapsed > DISMISS_SPEED_PX_PER_MS
    const isFar = distance > sheet.offsetHeight * DISMISS_SHARE
    if (!isFlick && !isFar) {
      sheet.style.transform = ""
      return
    }

    sheet.style.transform = "translateY(100%)"
    setTimeout(() => {
      onDismiss()
      sheet.addEventListener("close", () => reset(sheet), { once: true })
      setTimeout(() => {
        if (sheet.open) reset(sheet)
      }, SLIDE_OUT_MS)
    }, SLIDE_OUT_MS)
  }

  handle.addEventListener("pointermove", move)
  handle.addEventListener("pointerup", end)
  handle.addEventListener("pointercancel", end)
}

function reset(sheet) {
  sheet.style.transition = "none"
  sheet.style.transform = ""
  requestAnimationFrame(() => {
    sheet.style.transition = ""
  })
}
