/**
 * @typedef {import('../../../types/feedback/toast').ToastProps} ToastProps
 * @typedef {import('../../../types/feedback/toast').ToastItem} ToastItem
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { repeat } from "@inglorious/web/directives/repeat"
import { when } from "@inglorious/web/directives/when"

import { Icon } from "../../data-display/icon/index.js"
import { syncPopover } from "../../shared/top-layer.js"

const DEFAULT_DURATION_MS = 5000
const FIRST_INDEX = 0
const LEAVING = "iw-toast-leaving"

export const Toast = {
  /**
   * Renders a stack of toasts in a corner of the screen. The app owns the
   * list: the newest first, closest to the edge. Each toast closes itself
   * after its duration through `onClose(id)`; hovering or focusing it pauses
   * the countdown. A manual popover, so it shows above an open modal dialog.
   * @param {ToastProps} props
   * @returns {TemplateResult | null}
   */
  render(props) {
    const { toasts = [], position = "top-right", className = "" } = props
    if (!toasts.length) return null

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )

    return html`<section
      class=${classMap({
        "iw-toaster": true,
        [`iw-toaster-${position}`]: true,
        ...extraClasses,
      })}
      aria-live="polite"
      popover="manual"
      ${ref((element) => syncPopover(element, { isOpen: true }))}
    >
      ${repeat(
        toasts,
        (toast) => toast.id,
        (toast, index) => this.renderToast(toast, props, index),
      )}
    </section>`
  },

  /**
   * Renders one toast: an optional icon and title, the message, a close
   * button and the countdown bar. Closing it from either plays the exit,
   * which gives its room back to the others, and then calls `onClose(id)`.
   * Its position in the stack staggers the entrance of toasts that arrive
   * together.
   * @param {ToastItem} toast
   * @param {ToastProps} props
   * @param {number} [index]
   * @returns {TemplateResult}
   */
  renderToast(toast, props, index = FIRST_INDEX) {
    const {
      duration = DEFAULT_DURATION_MS,
      dismissLabel = "Dismiss",
      onClose,
      onClick,
    } = props
    const { id, title, message, icon, color = "default" } = toast
    const lifetime = toast.duration === undefined ? duration : toast.duration
    const content = html`
      ${when(icon, () =>
        Icon.render({ icon, size: "lg", className: "iw-toast-icon" }),
      )}
      <span class="iw-toast-text">
        ${when(title, () => html`<strong class="iw-toast-title">${title}</strong>`)}
        <span class="iw-toast-message">${message}</span>
      </span>
    `

    return html`<div
      class="iw-toast"
      style=${`--iw-toast-order: ${index};${lifetime ? ` --iw-toast-duration: ${lifetime}ms;` : ""}`}
      @animationend=${(event) => {
        if (event.target === event.currentTarget && isLeaving(event.target)) {
          onClose?.(id)
        }
      }}
    >
      <div class="iw-toast-slot">
        <div class="iw-toast-frame">
          <div
            class=${classMap({ "iw-toast-card": true, [`iw-toast-${color}`]: true })}
            role="status"
          >
            ${
              onClick
                ? html`<button
                    type="button"
                    class="iw-toast-main"
                    @click=${() => onClick(id)}
                  >
                    ${content}
                  </button>`
                : html`<div class="iw-toast-main">${content}</div>`
            }
            ${when(
              onClose,
              () =>
                html`<button
                  type="button"
                  class="iw-toast-close"
                  aria-label=${dismissLabel}
                  @click=${(event) => leave(event.currentTarget)}
                >
                  ×
                </button>`,
            )}
            ${when(
              lifetime && onClose,
              () =>
                html`<span
                  class="iw-toast-timer"
                  aria-hidden="true"
                  @animationend=${(event) => {
                    event.stopPropagation()
                    leave(event.currentTarget)
                  }}
                ></span>`,
            )}
          </div>
        </div>
      </div>
    </div>`
  },
}

function leave(from) {
  from.closest(".iw-toast")?.classList.add(LEAVING)
}

function isLeaving(element) {
  return element.classList.contains(LEAVING)
}
