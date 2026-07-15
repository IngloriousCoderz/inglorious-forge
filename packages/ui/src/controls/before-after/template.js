/**
 * @typedef {import('../../../types/controls/before-after.js').BeforeAfterProps} BeforeAfterProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

const DEFAULT_POSITION = 50
const DEFAULT_STEP = 1
const MIN_POSITION = 0
const MAX_POSITION = 100
const PRIMARY_BUTTON = 1

/**
 * Convert a pointer event into a divider position (0-100) relative to the
 * root element. Returns null when the element has no measurable width yet.
 * @param {PointerEvent} event
 * @param {HTMLElement} element
 * @returns {number | null}
 */
function positionFromEvent(event, element) {
  const rect = element.getBoundingClientRect()
  if (!rect.width) return null

  const percent = ((event.clientX - rect.left) / rect.width) * 100
  return clamp(percent)
}

/**
 * @param {number} value
 * @returns {number}
 */
function clamp(value) {
  return Math.max(MIN_POSITION, Math.min(MAX_POSITION, value))
}

/**
 * Renders a before/after image comparison slider.
 *
 * The reveal is pure CSS: the "after" layer is clipped with `clip-path`
 * driven by the `--iw-before-after-position` custom property, so moving the
 * divider is just a matter of updating one number. Dragging relies on pointer
 * capture plus `event.buttons`, which means no transient "isDragging" state is
 * needed — the only state the component owns is `position`.
 * @param {BeforeAfterProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    before,
    after,
    label,
    position = DEFAULT_POSITION,
    step = DEFAULT_STEP,
    isDisabled = false,
    isFullWidth = false,
    onSlide,
  } = props

  const handlePointerDown = (event) => {
    if (isDisabled) return
    const root = event.currentTarget
    root.setPointerCapture?.(event.pointerId)
    const percent = positionFromEvent(event, root)
    if (percent != null) onSlide?.(percent)
  }

  const handlePointerMove = (event) => {
    if (isDisabled) return
    // Only react while the primary button/contact is held down.
    if ((event.buttons & PRIMARY_BUTTON) === 0) return
    const percent = positionFromEvent(event, event.currentTarget)
    if (percent != null) onSlide?.(percent)
  }

  const handlePointerUp = (event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  const handleKeyDown = (event) => {
    if (isDisabled) return

    let next
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = position - step
        break
      case "ArrowRight":
      case "ArrowUp":
        next = position + step
        break
      case "Home":
        next = MIN_POSITION
        break
      case "End":
        next = MAX_POSITION
        break
      default:
        return
    }

    event.preventDefault()
    onSlide?.(clamp(next))
  }

  const classes = {
    "iw-before-after": true,
    "iw-before-after-full-width": isFullWidth,
    "iw-before-after-disabled": isDisabled,
  }

  return html`
    <div
      class=${classMap(classes)}
      style="--iw-before-after-position: ${position}%;"
      role="slider"
      tabindex=${isDisabled ? -1 : 0}
      aria-label=${label || "Before and after comparison"}
      aria-orientation="horizontal"
      aria-valuemin=${MIN_POSITION}
      aria-valuemax=${MAX_POSITION}
      aria-valuenow=${Math.round(position)}
      aria-disabled=${isDisabled}
      @pointerdown=${handlePointerDown}
      @pointermove=${handlePointerMove}
      @pointerup=${handlePointerUp}
      @pointercancel=${handlePointerUp}
      @keydown=${handleKeyDown}
    >
      <div class="iw-before-after-item iw-before-after-before">
        <img
          class="iw-before-after-image"
          src=${before?.src ?? ""}
          alt=${before?.alt ?? ""}
          draggable="false"
        />
      </div>
      <div class="iw-before-after-item iw-before-after-after">
        <img
          class="iw-before-after-image"
          src=${after?.src ?? ""}
          alt=${after?.alt ?? ""}
          draggable="false"
        />
      </div>
      <div class="iw-before-after-divider" aria-hidden="true">
        <div class="iw-before-after-handle"></div>
      </div>
    </div>
  `
}
