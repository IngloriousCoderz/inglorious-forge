/**
 * @typedef {import('../../../types/data-display/lightbox').LightboxProps} LightboxProps
 * @typedef {import('../../../types/data-display/lightbox').LightboxImage} LightboxImage
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { IconButton } from "../../controls/icon-button/index.js"
import { chevronLeft, chevronRight, close } from "../../shared/icons.js"
import { syncDialog } from "../../shared/top-layer.js"
import { Icon } from "../icon/index.js"

const SWIPE_PX = 40
const NEXT = 1
const PREVIOUS = -1

/**
 * Where each lightbox's current swipe started.
 * @type {WeakMap<HTMLDialogElement, number>}
 */
const swipeStarts = new WeakMap()

export const Lightbox = {
  /**
   * Renders images full screen in a modal `<dialog>`, one at a time. With more
   * than one, the arrows, the arrow keys and a horizontal swipe step through
   * them, following the writing direction. Esc, the close button and a press
   * outside the image close it.
   * @param {LightboxProps} props
   * @returns {TemplateResult | typeof nothing}
   */
  render(props) {
    const {
      id,
      images = [],
      index = 0,
      isOpen = false,
      label = "Photos",
      closeLabel = "Close",
      previousLabel = "Previous photo",
      nextLabel = "Next photo",
      className = "",
      onStep,
      onClose,
    } = props

    const total = images.length
    if (!total) return nothing

    const current = ((index % total) + total) % total
    const image = toImage(images[current])
    const isNavigable = total > 1 && Boolean(onStep)

    return html`<dialog
      id=${id || nothing}
      class=${["iw-lightbox", className].filter(Boolean).join(" ")}
      aria-label=${label}
      @click=${(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
      @cancel=${(event) => {
        if (!onClose) event.preventDefault()
      }}
      @keydown=${(event) => {
        if (!isNavigable) return
        const step = arrowStep(event)
        if (!step) return
        event.preventDefault()
        onStep(step)
      }}
      @pointerdown=${(event) => {
        swipeStarts.set(event.currentTarget, event.clientX)
      }}
      @pointerup=${(event) => {
        const startX = swipeStarts.get(event.currentTarget)
        swipeStarts.delete(event.currentTarget)
        if (!isNavigable || startX == null) return
        const distance = event.clientX - startX
        if (Math.abs(distance) < SWIPE_PX) return
        const towardsEnd = isRtl(event.currentTarget)
          ? distance > 0
          : distance < 0
        onStep(towardsEnd ? NEXT : PREVIOUS)
      }}
      @pointercancel=${(event) => swipeStarts.delete(event.currentTarget)}
      ${ref((element) => syncDialog(element, { isOpen, onClose }))}
    >
      ${when(onClose, () =>
        IconButton.render({
          icon: Icon.render({ icon: close, size: "lg" }),
          variant: "ghost",
          shape: "round",
          ariaLabel: closeLabel,
          className: "iw-lightbox-close",
          onClick: onClose,
        }),
      )}
      <div class="iw-lightbox-stage">
        <img
          class="iw-lightbox-image"
          src=${image.src}
          alt=${image.alt ?? ""}
          draggable="false"
        />
        ${when(
          isNavigable,
          () => html`
            ${IconButton.render({
              icon: Icon.render({ icon: chevronLeft, size: "lg" }),
              variant: "ghost",
              shape: "round",
              ariaLabel: previousLabel,
              className: "iw-lightbox-nav iw-lightbox-previous",
              onClick: () => onStep(PREVIOUS),
            })}
            ${IconButton.render({
              icon: Icon.render({ icon: chevronRight, size: "lg" }),
              variant: "ghost",
              shape: "round",
              ariaLabel: nextLabel,
              className: "iw-lightbox-nav iw-lightbox-next",
              onClick: () => onStep(NEXT),
            })}
            <div class="iw-lightbox-counter" aria-hidden="true">
              ${current + 1}/${total}
            </div>
          `,
        )}
      </div>
    </dialog>`
  },
}

/**
 * @param {string | LightboxImage} image
 * @returns {LightboxImage}
 */
function toImage(image) {
  return typeof image === "string" ? { src: image } : image
}

function arrowStep(event) {
  const towardsEnd = isRtl(event.currentTarget) ? "ArrowLeft" : "ArrowRight"
  const towardsStart = isRtl(event.currentTarget) ? "ArrowRight" : "ArrowLeft"
  if (event.key === towardsEnd) return NEXT
  if (event.key === towardsStart) return PREVIOUS
  return 0
}

function isRtl(element) {
  return getComputedStyle(element).direction === "rtl"
}
