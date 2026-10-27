/**
 * @typedef {import('../../../types/feedback/snackbar').SnackbarProps} SnackbarProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { syncPopover } from "../../shared/top-layer.js"

/**
 * Renders a transient snackbar message with optional action and dismiss control.
 * Position is configurable (for example bottom-left or top-right).
 * A manual popover, so it shows in the top layer, above an open modal dialog,
 * and only `isOpen` or its close button take it down.
 * @param {SnackbarProps} props
 * @returns {TemplateResult | null}
 */
export function render(props) {
  const {
    isOpen = false,
    message,
    action,
    className = "",
    position = "bottom-left",
    onClose,
  } = props

  if (!isOpen) return null

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  return html`<div
    class=${classMap({
      "iw-snackbar": true,
      [`iw-snackbar-${position}`]: true,
      ...extraClasses,
    })}
    role="status"
    aria-live="polite"
    popover="manual"
    ${ref((element) => syncPopover(element, { isOpen: true }))}
  >
    <div class="iw-snackbar-content">
      <span class="iw-snackbar-message">${message}</span>
      ${when(action, () => html`<span class="iw-snackbar-action">${action}</span>`)}
      ${when(
        onClose,
        () =>
          html`<button
            type="button"
            class="iw-snackbar-close"
            aria-label="Dismiss"
            @click=${onClose}
          >
            ×
          </button>`,
      )}
    </div>
  </div>`
}
