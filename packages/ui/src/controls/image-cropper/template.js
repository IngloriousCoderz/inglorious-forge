/**
 * @typedef {import('../../../types/controls/image-cropper.js').ImageCropperProps} ImageCropperProps
 * @typedef {import('../../../types/controls/image-cropper.js').CropRect} CropRect
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

import {
  DEFAULT_MIN_SIZE,
  DEFAULT_STEP,
  fitRect,
  FULL_RECT,
  HANDLES,
  hitTest,
  normalizeAspect,
  panRect,
  PERCENT,
  resizeRect,
  scaleRect,
} from "./helpers.js"

const HANDLE_HIT_PX = 22
const MIN_PINCH_POINTERS = 2
const PRIMARY_BUTTON = 0
const WHEEL_SCALE_RATE = 0.0015

const ARROW_MOVES = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

// Pointers and the drag in progress belong to one element and never reach the
// store: they change on every move and are meaningless once the gesture ends.
/** @type {WeakMap<Element, { pointers: Map<number, { x: number, y: number }>, drag: object | null, pinch: object | null }>} */
const gestures = new WeakMap()

export const ImageCropper = {
  /**
   * Main entrypoint for the image cropper template. It delegates to the base renderer so overrides can still reuse it.
   * The image cropper shows the whole image with a movable, resizable frame on top.
   * @param {ImageCropperProps} props The image cropper props.
   * @returns {TemplateResult} The rendered control.
   */
  render(props) {
    return this.renderImageCropper(props)
  },

  /**
   * Renders the stage and wires the pointer, wheel and keyboard interactions.
   * This is the canonical renderer that custom `render()` overrides should call.
   * @param {ImageCropperProps} props The image cropper props.
   * @returns {TemplateResult} The rendered control.
   */
  renderImageCropper(props) {
    const { label, isDisabled = false, hasError = false } = props
    const isLoaded = isImageLoaded(props)

    const classes = {
      "iw-image-cropper": true,
      "iw-image-cropper-loaded": isLoaded,
      "iw-image-cropper-error": hasError,
      "iw-image-cropper-disabled": isDisabled,
    }
    const style = isLoaded
      ? `--iw-image-cropper-aspect: ${props.naturalWidth / props.naturalHeight};`
      : ""

    return html`<div
      class=${classMap(classes)}
      style=${style}
      role="group"
      aria-roledescription="crop area"
      aria-label=${label || "Crop area"}
      tabindex=${isDisabled ? -1 : 0}
      aria-disabled=${isDisabled}
      @pointerdown=${handlePointerDown(props)}
      @pointermove=${handlePointerMove(props)}
      @pointerup=${handlePointerUp}
      @pointercancel=${handlePointerUp}
      @keydown=${handleKeyDown(props)}
      @wheel=${handleWheel(props)}
    >
      ${this.renderImage?.(props)} ${isLoaded ? this.renderFrame?.(props) : ""}
    </div>`
  },

  /**
   * Renders the frame over the image. Its outline shadow dims everything
   * outside of it, and the stage clips the shadow.
   * @param {ImageCropperProps} props The image cropper props.
   * @returns {TemplateResult} The rendered frame.
   */
  renderFrame(props) {
    const { x, y, w, h } = props.rect ?? FULL_RECT

    return html`<div
      class="iw-image-cropper-frame"
      style="left: ${x * PERCENT}%; top: ${y * PERCENT}%; width: ${
        w * PERCENT
      }%; height: ${h * PERCENT}%;"
    >
      ${HANDLES.map((handle) => this.renderHandle?.(props, handle))}
    </div>`
  },

  /**
   * Renders the grip on one edge or corner of the frame.
   * Override this to supply a custom handle, or return nothing to hide them.
   * @param {ImageCropperProps} props The image cropper props.
   * @param {string} handle Which grip: n, ne, e, se, s, sw, w or nw.
   * @returns {TemplateResult} The rendered handle.
   */
  renderHandle(props, handle) {
    return html`<span
      class="iw-image-cropper-handle iw-image-cropper-handle-${handle}"
      aria-hidden="true"
    ></span>`
  },

  /**
   * Renders the whole image, which also gives the stage its proportions.
   * @param {ImageCropperProps} props The image cropper props.
   * @returns {TemplateResult} The rendered image.
   */
  renderImage(props) {
    return html`<img
      class="iw-image-cropper-image"
      src=${props.src ?? ""}
      alt=${props.alt ?? ""}
      draggable="false"
      @load=${handleLoad(props)}
      @error=${() => props.onImageError?.()}
    />`
  },
}

/**
 * Distance between the first two active pointers, for pinch scaling.
 * @param {Map<number, { x: number, y: number }>} pointers
 * @returns {number}
 */
function distanceBetween(pointers) {
  const [first, second] = pointers.values()
  return Math.hypot(first.x - second.x, first.y - second.y)
}

/**
 * The gesture state of an element, created on first use.
 * @param {Element} element
 */
function gestureOf(element) {
  let gesture = gestures.get(element)
  if (!gesture) {
    gesture = { pointers: new Map(), drag: null, pinch: null }
    gestures.set(element, gesture)
  }
  return gesture
}

/**
 * Arrows move the frame, Shift+arrows resize it from the bottom-right corner,
 * +/- scale it, and Home resets it to the largest frame that fits.
 * @param {ImageCropperProps} props
 * @returns {(event: KeyboardEvent) => void}
 */
function handleKeyDown(props) {
  return (event) => {
    if (props.isDisabled || !isImageLoaded(props)) return

    const rect = props.rect ?? FULL_RECT
    const step = props.step ?? DEFAULT_STEP
    const options = rectOptions(props)

    let next
    if (event.key in ARROW_MOVES) {
      const [dx, dy] = ARROW_MOVES[event.key].map((sign) => sign * step)
      next = event.shiftKey
        ? resizeRect(rect, "se", dx, dy, options)
        : panRect(rect, dx, dy, options)
    } else if (event.key === "+" || event.key === "=") {
      next = scaleRect(rect, 1 + step, options)
    } else if (event.key === "-" || event.key === "_") {
      next = scaleRect(rect, 1 / (1 + step), options)
    } else if (event.key === "Home") {
      next = fitRect(options.aspect)
    } else {
      return
    }

    event.preventDefault()
    props.onRectChange?.(next)
  }
}

/**
 * Report the image's natural size once it has loaded.
 * @param {ImageCropperProps} props
 * @returns {(event: Event) => void}
 */
function handleLoad(props) {
  return (event) => {
    const image = /** @type {HTMLImageElement} */ (event.currentTarget)
    props.onImageLoad?.({
      width: image.naturalWidth,
      height: image.naturalHeight,
    })
  }
}

/**
 * Start a gesture: a second finger turns any drag into a pinch; otherwise the
 * handle under the pointer decides between moving and resizing the frame.
 * @param {ImageCropperProps} props
 * @returns {(event: PointerEvent) => void}
 */
function handlePointerDown(props) {
  return (event) => {
    if (props.isDisabled || !isImageLoaded(props)) return
    if (event.pointerType === "mouse" && event.button !== PRIMARY_BUTTON) return

    const element = /** @type {Element} */ (event.currentTarget)
    element.setPointerCapture?.(event.pointerId)

    const gesture = gestureOf(element)
    gesture.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    const rect = props.rect ?? FULL_RECT

    if (gesture.pointers.size >= MIN_PINCH_POINTERS) {
      gesture.drag = null
      gesture.pinch = { distance: distanceBetween(gesture.pointers), rect }
      return
    }

    const point = pointFromEvent(event)
    if (!point) return
    const handle = hitTest(point, rect, hitTolerance(element))
    gesture.drag = handle ? { handle, origin: point, rect } : null
  }
}

/**
 * Follow the gesture. Every step is computed from where it started, so it does
 * not drift while the store catches up.
 * @param {ImageCropperProps} props
 * @returns {(event: PointerEvent) => void}
 */
function handlePointerMove(props) {
  return (event) => {
    const gesture = gestures.get(/** @type {Element} */ (event.currentTarget))
    if (!gesture?.pointers.has(event.pointerId)) return

    gesture.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    const options = rectOptions(props)

    if (gesture.pinch) {
      if (gesture.pointers.size < MIN_PINCH_POINTERS) return
      const { distance, rect } = gesture.pinch
      if (!distance) return
      const factor = distanceBetween(gesture.pointers) / distance
      props.onRectChange?.(scaleRect(rect, factor, options))
      return
    }

    const { drag } = gesture
    const point = drag && pointFromEvent(event)
    if (!point) return

    const dx = point.x - drag.origin.x
    const dy = point.y - drag.origin.y
    props.onRectChange?.(
      drag.handle === "move"
        ? panRect(drag.rect, dx, dy, options)
        : resizeRect(drag.rect, drag.handle, dx, dy, options),
    )
  }
}

/**
 * End the gesture for this pointer. Lifting one finger of a pinch ends the
 * pinch without starting a drag, so the frame does not jump.
 * @param {PointerEvent} event
 */
function handlePointerUp(event) {
  const element = /** @type {Element} */ (event.currentTarget)
  element.releasePointerCapture?.(event.pointerId)

  const gesture = gestures.get(element)
  if (!gesture) return
  gesture.pointers.delete(event.pointerId)
  gesture.drag = null
  if (!gesture.pointers.size) gesture.pinch = null
}

/**
 * The wheel scales the frame: scrolling down grows it, scrolling up shrinks it.
 * @param {ImageCropperProps} props
 * @returns {(event: WheelEvent) => void}
 */
function handleWheel(props) {
  return (event) => {
    if (props.isDisabled || !isImageLoaded(props) || !event.deltaY) return

    event.preventDefault()
    const factor = Math.exp(event.deltaY * WHEEL_SCALE_RATE)
    props.onRectChange?.(
      scaleRect(props.rect ?? FULL_RECT, factor, rectOptions(props)),
    )
  }
}

/**
 * How close to an edge, in image fractions, still counts as grabbing it.
 * @param {Element} element
 * @returns {{ x: number, y: number }}
 */
function hitTolerance(element) {
  const { width, height } = element.getBoundingClientRect()
  return {
    x: width ? HANDLE_HIT_PX / width : 0,
    y: height ? HANDLE_HIT_PX / height : 0,
  }
}

/**
 * Whether the image has reported its size, which is when the frame shows.
 * @param {ImageCropperProps} props
 * @returns {boolean}
 */
function isImageLoaded(props) {
  return props.naturalWidth > 0 && props.naturalHeight > 0
}

/**
 * Convert a pointer event into image fractions, relative to the element the
 * listener is attached to. Null when it has no measurable size.
 * @param {PointerEvent} event
 * @returns {{ x: number, y: number } | null}
 */
function pointFromEvent(event) {
  const bounds = /** @type {Element} */ (
    event.currentTarget
  ).getBoundingClientRect()
  if (!bounds.width || !bounds.height) return null

  return {
    x: (event.clientX - bounds.left) / bounds.width,
    y: (event.clientY - bounds.top) / bounds.height,
  }
}

/**
 * The constraints every frame change obeys.
 * @param {ImageCropperProps} props
 */
function rectOptions(props) {
  return {
    minSize: props.minSize ?? DEFAULT_MIN_SIZE,
    aspect: normalizeAspect(
      props.aspectRatio,
      props.naturalWidth,
      props.naturalHeight,
    ),
  }
}
