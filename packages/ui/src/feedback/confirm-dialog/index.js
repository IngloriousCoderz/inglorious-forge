/**
 * @typedef {import('../../../types/feedback/confirm-dialog').ConfirmDialogProps} ConfirmDialogProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"

import { Button } from "../../controls/button/index.js"
import { Dialog } from "../dialog/index.js"

export const ConfirmDialog = {
  /**
   * Renders a sheet asking to confirm an action, with the confirm button first.
   * While `isBusy` it cannot be dismissed, and the confirm button shows
   * `busyLabel`.
   * @param {ConfirmDialogProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      id,
      isOpen = false,
      message,
      children,
      confirmLabel,
      busyLabel = confirmLabel,
      cancelLabel = "Cancel",
      closeLabel,
      tone = "danger",
      isBusy = false,
      isDisabled = false,
      className = "",
      onConfirm,
      onCancel,
    } = props

    const isDanger = tone === "danger"

    return Dialog.render({
      id,
      isOpen,
      variant: "sheet",
      size: "sm",
      description: message,
      children,
      className: ["iw-confirm-dialog", className].filter(Boolean).join(" "),
      closeLabel,
      actions: html`<div class="iw-confirm-dialog-actions">
        ${Button.render({
          children: isBusy ? busyLabel : confirmLabel,
          color: isDanger ? "error" : "primary",
          variant: isDanger ? "outline" : "default",
          shape: "pill",
          size: "md",
          isDisabled: isBusy || isDisabled,
          onClick: () => {
            if (!isBusy && !isDisabled) onConfirm?.()
          },
        })}
        ${Button.render({
          children: cancelLabel,
          variant: "outline",
          shape: "pill",
          size: "md",
          isDisabled: isBusy,
          onClick: onCancel,
        })}
      </div>`,
      onClose: isBusy ? undefined : onCancel,
    })
  },
}
