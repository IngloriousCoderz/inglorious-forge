/**
 * @typedef {import('../../../types/feedback/snackbar').SnackbarProps} SnackbarProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

/**
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
  >
    <div class="iw-snackbar-content">
      <span class="iw-snackbar-message">${message}</span>
      ${action ? html`<span class="iw-snackbar-action">${action}</span>` : null}
      ${onClose
        ? html`<button
            type="button"
            class="iw-snackbar-close"
            aria-label="Dismiss"
            @click=${onClose}
          >
            ×
          </button>`
        : null}
    </div>
  </div>`
}
