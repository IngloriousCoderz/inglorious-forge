/**
 * @typedef {import('../../../types/feedback/dialog').DialogProps} DialogProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { syncDialog } from "../../shared/top-layer.js"

/**
 * Whether the last press on each dialog started on its backdrop.
 * @type {WeakMap<HTMLDialogElement, boolean>}
 */
const backdropPresses = new WeakMap()

/**
 * Renders a native `<dialog>` with header, body, and actions.
 * Modal by default: the browser traps focus, makes the page inert, closes on
 * Esc and returns focus to the trigger. Clicking the backdrop can close the
 * dialog when handlers are provided.
 * @param {DialogProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    isOpen = false,
    isModal = true,
    size = "md",
    title,
    description,
    children,
    actions,
    className = "",
    onClose,
    onBackdropClick,
  } = props

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const titleId = id && title ? `${id}-title` : ""
  const descriptionId = id && description ? `${id}-description` : ""
  const onBackdrop = onBackdropClick ?? onClose

  // The surface fills the dialog box, so a click that lands on the dialog
  // itself can only have come from the backdrop around it. The press has to
  // start there too: a drag from inside the surface that ends on the backdrop
  // also clicks the dialog, and must not close it.
  return html`<dialog
    id=${id || nothing}
    class=${classMap({
      "iw-dialog": true,
      [`iw-dialog-${size}`]: true,
      ...extraClasses,
    })}
    aria-labelledby=${titleId || nothing}
    aria-describedby=${descriptionId || nothing}
    @pointerdown=${(event) => {
      backdropPresses.set(
        event.currentTarget,
        event.target === event.currentTarget,
      )
    }}
    @click=${(event) => {
      const isBackdropPress = backdropPresses.get(event.currentTarget)
      backdropPresses.delete(event.currentTarget)
      if (event.target === event.currentTarget && isBackdropPress) {
        onBackdrop?.()
      }
    }}
    @cancel=${(event) => {
      // Without onClose nothing would take isOpen down, so Esc is refused.
      if (!onClose) event.preventDefault()
    }}
    ${ref((element) => syncDialog(element, { isOpen, isModal, onClose }))}
  >
    <div class="iw-dialog-surface">
      ${
        (title || onClose) &&
        html`<div class="iw-dialog-header">
          ${
            title
              ? html`<div id=${titleId || nothing} class="iw-dialog-title">
                  ${title}
                </div>`
              : null
          }
          ${
            onClose
              ? html`<button
                  type="button"
                  class="iw-dialog-close"
                  aria-label="Close"
                  @click=${onClose}
                >
                  ×
                </button>`
              : null
          }
        </div>`
      }
      ${
        description
          ? html`<div
              id=${descriptionId || nothing}
              class="iw-dialog-description"
            >
              ${description}
            </div>`
          : null
      }
      ${children ? html`<div class="iw-dialog-body">${children}</div>` : null}
      ${actions ? html`<div class="iw-dialog-actions">${actions}</div>` : null}
    </div>
  </dialog>`
}
