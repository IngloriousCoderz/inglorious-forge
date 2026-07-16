/**
 * @typedef {import('../../../types/controls/before-after.js').BeforeAfterProps} BeforeAfterProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { clamp } from "@inglorious/utils/math/numbers.js"
import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

import {
  DEFAULT_POSITION,
  DEFAULT_STEP,
  MAX_POSITION,
  MIN_POSITION,
} from "./helpers.js"

const PRIMARY_BUTTON = 1

export const BeforeAfter = {
  /**
   * Main entrypoint for the before/after template. It delegates to the base renderer so overrides can still reuse it.
   * Before/after overlays two images and reveals the top one with a draggable divider.
   * @param {BeforeAfterProps} props The before/after props.
   * @returns {TemplateResult} The rendered control.
   */
  render(props) {
    return this.renderBeforeAfter(props)
  },

  /**
   * Renders the container and wires the pointer and keyboard interactions.
   * This is the canonical renderer that custom `render()` overrides should call.
   * @param {BeforeAfterProps} props The before/after props.
   * @returns {TemplateResult} The rendered control.
   */
  renderBeforeAfter(props) {
    const {
      label,
      position = DEFAULT_POSITION,
      isDisabled = false,
      isFullWidth = false,
    } = props

    const classes = {
      "iw-before-after": true,
      "iw-before-after-full-width": isFullWidth,
      "iw-before-after-disabled": isDisabled,
    }

    return html`<div
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
      @pointerdown=${handlePointerDown(props)}
      @pointermove=${handlePointerMove(props)}
      @pointerup=${handlePointerUp}
      @pointercancel=${handlePointerUp}
      @keydown=${handleKeyDown(props)}
    >
      ${this.renderBefore?.(props)} ${this.renderAfter?.(props)}
      ${this.renderDivider?.(props)}
    </div>`
  },

  /**
   * Renders the bottom layer, fully visible underneath the clipped one.
   * It also gives the control its intrinsic size.
   * @param {BeforeAfterProps} props The before/after props.
   * @returns {TemplateResult} The rendered layer.
   */
  renderBefore(props) {
    return html`<div class="iw-before-after-item iw-before-after-before">
      <img
        class="iw-before-after-image"
        src=${props.before?.src ?? ""}
        alt=${props.before?.alt ?? ""}
        draggable="false"
      />
    </div>`
  },

  /**
   * Renders the top layer, clipped to the current divider position through CSS.
   * @param {BeforeAfterProps} props The before/after props.
   * @returns {TemplateResult} The rendered layer.
   */
  renderAfter(props) {
    return html`<div class="iw-before-after-item iw-before-after-after">
      <img
        class="iw-before-after-image"
        src=${props.after?.src ?? ""}
        alt=${props.after?.alt ?? ""}
        draggable="false"
      />
    </div>`
  },

  /**
   * Renders the vertical bar sitting on the seam between the two layers.
   * Override this to change the separator, or drop the handle entirely.
   * @param {BeforeAfterProps} props The before/after props.
   * @returns {TemplateResult} The rendered divider.
   */
  renderDivider(props) {
    return html`<div class="iw-before-after-divider" aria-hidden="true">
      ${this.renderHandle?.(props)}
    </div>`
  },

  /**
   * Renders the grip shown at the centre of the divider.
   * Override this to supply a custom handle.
   * @returns {TemplateResult} The rendered handle.
   */
  renderHandle() {
    return html`<div class="iw-before-after-handle"></div>`
  },
}

/**
 * Start dragging: capture the pointer so moves keep tracking outside the box.
 * @param {BeforeAfterProps} props
 * @returns {(event: PointerEvent) => void}
 */
function handlePointerDown(props) {
  return (event) => {
    if (props.isDisabled) return

    event.currentTarget.setPointerCapture?.(event.pointerId)
    move(props, event)
  }
}

/**
 * Track the divider while the primary button or contact is held down.
 * @param {BeforeAfterProps} props
 * @returns {(event: PointerEvent) => void}
 */
function handlePointerMove(props) {
  return (event) => {
    if (props.isDisabled) return
    if (!(event.buttons & PRIMARY_BUTTON)) return

    move(props, event)
  }
}

/**
 * Stop dragging.
 * @param {PointerEvent} event
 */
function handlePointerUp(event) {
  event.currentTarget.releasePointerCapture?.(event.pointerId)
}

/**
 * Move the divider with the arrow keys, or jump to either edge.
 * @param {BeforeAfterProps} props
 * @returns {(event: KeyboardEvent) => void}
 */
function handleKeyDown(props) {
  return (event) => {
    if (props.isDisabled) return

    const position = props.position ?? DEFAULT_POSITION
    const step = props.step ?? DEFAULT_STEP

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
    props.onPositionChange?.(clamp(next, MIN_POSITION, MAX_POSITION))
  }
}

/**
 * Report the divider position under the pointer.
 * @param {BeforeAfterProps} props
 * @param {PointerEvent} event
 */
function move(props, event) {
  const position = positionFromEvent(event)
  if (position != null) props.onPositionChange?.(position)
}

/**
 * Convert a pointer event into a divider position (0-100) relative to the
 * element the listener is attached to. Null when it has no measurable width.
 * @param {PointerEvent} event
 * @returns {number | null}
 */
function positionFromEvent(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  if (!rect.width) return null

  return clamp(
    ((event.clientX - rect.left) / rect.width) * 100,
    MIN_POSITION,
    MAX_POSITION,
  )
}
