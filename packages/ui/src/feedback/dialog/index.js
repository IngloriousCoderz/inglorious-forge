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
import { dragToDismiss } from "../../shared/drag-dismiss.js"
import { close } from "../../shared/icons.js"
import { syncDialog } from "../../shared/top-layer.js"

/**
 * Whether the last press on each dialog started on its backdrop.
 * @type {WeakMap<HTMLDialogElement, boolean>}
 */
const backdropPresses = new WeakMap()

export const Dialog = {
  /**
   * Renders a native `<dialog>` with header, body, and actions.
   * Modal by default: the browser traps focus, makes the page inert, closes on
   * Esc and returns focus to the trigger. Clicking the backdrop can close the
   * dialog when handlers are provided.
   * @param {DialogProps} props
   * @returns {TemplateResult}
   */
  render(props) {
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
    // Without a title, the description is what the dialog asks: its name.
    const labelId = titleId || descriptionId
    const describedById = titleId ? descriptionId : ""
    const onBackdrop = onBackdropClick ?? onClose
    const isSheet = variant === "sheet"
    const onDragStart =
      isSheet && onClose ? (event) => dragToDismiss(event, onClose) : null

    return html`<dialog
      id=${id || nothing}
      class=${classMap({
        "iw-dialog": true,
        [`iw-dialog-${size}`]: true,
        "iw-dialog-sheet": isSheet,
        ...extraClasses,
      })}
      aria-labelledby=${labelId || nothing}
      aria-describedby=${describedById || nothing}
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
        if (!onClose) event.preventDefault()
      }}
      ${ref((element) => syncDialog(element, { isOpen, isModal, onClose }))}
    >
      <div class="iw-dialog-surface">
        ${when(
          onDragStart,
          () =>
            html`<div
              class="iw-dialog-handle"
              aria-hidden="true"
              @pointerdown=${onDragStart}
            ></div>`,
        )}
        ${when(
          title || onClose,
          () =>
            html`<div
              class="iw-dialog-header"
              @pointerdown=${onDragStart ?? nothing}
            >
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
  },
}
