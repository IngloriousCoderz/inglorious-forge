/**
 * @typedef {import('../../../types/feedback/action-sheet').ActionSheetProps} ActionSheetProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { repeat } from "@inglorious/web/directives/repeat"

import { Button } from "../../controls/button/index.js"
import { Dialog } from "../dialog/index.js"

export const ActionSheet = {
  /**
   * Renders a sheet of choices about one thing, such as "Share", "Edit" or
   * "Delete" for a photo, with a cancel button set apart. Picking an action
   * runs it and closes the sheet. Below 48rem it rises from the bottom edge
   * and can be dragged away; wider, it is a small centred dialog.
   * @param {ActionSheetProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      id,
      isOpen = false,
      title,
      message,
      actions = [],
      cancelLabel = "Cancel",
      closeLabel,
      className = "",
      onClose,
    } = props

    return Dialog.render({
      id,
      isOpen,
      variant: "sheet",
      size: "sm",
      title,
      description: message,
      closeLabel,
      className: ["iw-action-sheet", className].filter(Boolean).join(" "),
      children: html`<div class="iw-action-sheet-actions" role="group">
        ${repeat(
          actions,
          (action) => action.id ?? action.label,
          (action) =>
            Button.render({
              children: html`${action.icon ?? ""}<span>${action.label}</span>`,
              color: action.color ?? "primary",
              variant: "ghost",
              size: "lg",
              isFullWidth: true,
              isDisabled: action.isDisabled,
              className: "iw-action-sheet-action",
              onClick: () => {
                action.onClick?.()
                onClose?.()
              },
            }),
        )}
      </div>`,
      actions: Button.render({
        children: cancelLabel,
        variant: "outline",
        size: "lg",
        isFullWidth: true,
        className: "iw-action-sheet-cancel",
        onClick: onClose,
      }),
      onClose,
    })
  },
}
