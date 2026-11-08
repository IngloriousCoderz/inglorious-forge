/**
 * The CSS anchor name that ties a popover to the element it opens from.
 * Set as `anchor-name` on the trigger and `position-anchor` on the popover,
 * so the browser positions the popover against it, flipping when it runs out
 * of room. Built from the popover's id, which is unique on the page.
 * @param {string} id
 * @returns {string}
 */
export function anchorName(id) {
  return `--iw-anchor-${String(id).replace(/[^\w-]/g, "-")}`
}

/**
 * @typedef {"top" | "bottom" | "bottom-start" | "left" | "right"} AnchorPlacement
 * @typedef {{
 *   getAnchor: () => Element | null,
 *   placement: AnchorPlacement,
 *   isWidthMatched?: boolean,
 * }} AnchorFallbackOptions
 */

const PLACED_STYLES = ["top", "right", "bottom", "left", "width", "translate"]

/** @type {WeakMap<HTMLElement, AnchorFallbackOptions>} */
const latestOptions = new WeakMap()

/**
 * Places a top-layer popover against its anchor where CSS anchor positioning
 * is missing (Safari before 26), which otherwise leaves it at the bottom of
 * the viewport. Runs from a `ref` on every render; listeners are added once.
 * @param {HTMLElement | undefined} popover
 * @param {AnchorFallbackOptions} options
 */
export function anchorFallback(popover, options) {
  if (!popover || isAnchorSupported()) return
  const isTracked = latestOptions.has(popover)
  latestOptions.set(popover, options)
  if (isTracked) return

  const place = () => placePopover(popover, latestOptions.get(popover))
  const onToggle = (event) => {
    if (event.newState === "open") {
      place()
      addEventListener("scroll", place, { capture: true, passive: true })
      addEventListener("resize", place, { passive: true })
    } else {
      removeEventListener("scroll", place, { capture: true })
      removeEventListener("resize", place)
    }
  }
  popover.addEventListener("beforetoggle", onToggle)
  popover.addEventListener("toggle", onToggle)
}

function isAnchorSupported() {
  return globalThis.CSS?.supports?.("anchor-name: --iw-anchor") ?? false
}

function placePopover(popover, { getAnchor, placement, isWidthMatched }) {
  const anchor = getAnchor()
  if (!anchor) return

  const rect = anchor.getBoundingClientRect()
  const { innerWidth, innerHeight } = window
  const isRtl = getComputedStyle(anchor).direction === "rtl"
  const style = {}

  if (placement === "bottom-start") {
    const spaceBelow = innerHeight - rect.bottom
    const isFlipped = popover.offsetHeight > spaceBelow && rect.top > spaceBelow
    if (isFlipped) style.bottom = innerHeight - rect.top
    else style.top = rect.bottom
    if (isRtl) style.right = innerWidth - rect.right
    else style.left = rect.left
  }

  if (placement === "top" || placement === "bottom") {
    if (placement === "top") style.bottom = innerHeight - rect.top
    else style.top = rect.bottom
    style.left = rect.left + rect.width / 2
    style.translate = "-50% 0"
  }

  if (placement === "left" || placement === "right") {
    if (placement === "left") style.right = innerWidth - rect.left
    else style.left = rect.right
    style.top = rect.top + rect.height / 2
    style.translate = "0 -50%"
  }

  if (isWidthMatched) style.width = rect.width

  for (const name of PLACED_STYLES) {
    const value = style[name]
    popover.style[name] =
      value == null ? "" : typeof value === "number" ? `${value}px` : value
  }
}
