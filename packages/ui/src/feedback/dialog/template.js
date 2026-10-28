/**
 * @typedef {import('../../../types/feedback/dialog').DialogProps} DialogProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { when } from "@inglorious/web/directives/when"

import { IconButton } from "../../controls/icon-button/index.js"
import { Icon } from "../../data-display/icon/index.js"
import { close } from "../../shared/icons.js"
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
    variant = "dialog",
    size = "md",
    title,
    description,
    children,
    actions,
    className = "",
    closeLabel = "Close",
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
      "iw-dialog-sheet": variant === "sheet",
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
      ${when(
        title || onClose,
        () =>
          html`<div class="iw-dialog-header">
            ${when(
              title,
              () =>
                html`<div id=${titleId || nothing} class="iw-dialog-title">
                  ${title}
                </div>`,
            )}
            ${when(onClose, () =>
              IconButton.render({
                icon: Icon.render({ icon: close, size: "lg" }),
                ariaLabel: closeLabel,
                variant: "ghost",
                color: "secondary",
                shape: "round",
                className: "iw-dialog-close",
                onClick: onClose,
              }),
            )}
          </div>`,
      )}
      ${when(
        description,
        () =>
          html`<div
            id=${descriptionId || nothing}
            class="iw-dialog-description"
          >
            ${description}
          </div>`,
      )}
      ${when(children, () => html`<div class="iw-dialog-body">${children}</div>`)}
      ${when(actions, () => html`<div class="iw-dialog-actions">${actions}</div>`)}
    </div>
  </dialog>`
}
