const ANNOUNCER_ID = "iw-route-announcer"
// Long enough for screen readers to notice the live region emptied first.
const ANNOUNCE_DELAY_MS = 100
const VISUALLY_HIDDEN =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0"

/**
 * Makes client-side navigation do for assistive technology what a full page load does:
 * the new page is announced to screen readers, and focus moves back to the top of the
 * document, so the next Tab starts from the beginning of the new page. An element with
 * `autofocus` on the new page gets the focus instead.
 *
 * A navigation leaves focus where it is when its history state has `isFocusKept`,
 * which a link sets with `data-is-focus-kept`. The page is still announced.
 *
 * `mount` calls the function this returns after each render, so the new page is in
 * the document by the time focus moves.
 *
 * @param {Object} [options]
 * @param {() => string | null} [options.getPageName] - The name of the current page, or
 *   `null` to be asked again after the next render; by default the document title.
 * @returns {() => void} The function to call after each render.
 */
export function createAccessibleNavigation({
  getPageName = () => document.title,
} = {}) {
  // Screen readers only announce changes made after the live region is in the document.
  const announcer = getAnnouncer()
  let currentPath = window.location.pathname
  let hasPendingAnnouncement = false
  let announceTimeout = null

  // Screen readers speak only when the live region changes, so it is emptied first and
  // filled on a later task: two pages with the same name are each announced.
  function announce(message) {
    announcer.textContent = ""
    clearTimeout(announceTimeout)
    announceTimeout = setTimeout(() => {
      announcer.textContent = message
    }, ANNOUNCE_DELAY_MS)
  }

  return function afterRender() {
    const path = window.location.pathname
    if (path !== currentPath) {
      currentPath = path
      hasPendingAnnouncement = true

      if (!window.history.state?.isFocusKept) {
        resetFocus()
      }
    }

    if (!hasPendingAnnouncement) return

    const name = getPageName()
    if (name == null) return

    hasPendingAnnouncement = false
    announce(name || document.querySelector("h1")?.textContent || path)
  }
}

function getAnnouncer() {
  const existing = document.getElementById(ANNOUNCER_ID)
  if (existing) return existing

  const announcer = document.createElement("div")
  announcer.id = ANNOUNCER_ID
  announcer.setAttribute("aria-live", "assertive")
  announcer.setAttribute("aria-atomic", "true")
  announcer.style.cssText = VISUALLY_HIDDEN
  document.body.append(announcer)
  return announcer
}

// Focusing the body makes the next Tab start from the top of the new page, rather
// than from the link that was clicked, which may no longer exist.
function resetFocus() {
  const autofocus = document.querySelector("[autofocus]")
  if (autofocus) {
    autofocus.focus()
    return
  }

  const { body } = document
  const tabIndex = body.getAttribute("tabindex")
  body.tabIndex = -1
  body.focus({ preventScroll: true })
  if (tabIndex === null) {
    body.removeAttribute("tabindex")
  } else {
    body.setAttribute("tabindex", tabIndex)
  }
}
