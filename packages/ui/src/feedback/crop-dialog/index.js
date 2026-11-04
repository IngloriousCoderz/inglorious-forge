/**
 * @typedef {import('../../../types/feedback/crop-dialog').CropDialogProps} CropDialogProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 * @typedef {import('@inglorious/web').Api} Api
 */

import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

import { Button } from "../../controls/button/index.js"
import { Alert } from "../alert/index.js"
import { Dialog } from "../dialog/index.js"

export const CropDialog = {
  /**
   * Renders an ImageCropper entity in a dialog, with cancel and apply buttons.
   * Apply stays disabled until the image has loaded, and passes the cropper's
   * `rect`.
   * @param {CropDialogProps} props
   * @param {Api} api
   * @returns {TemplateResult}
   */
  render(props, api) {
    const {
      id,
      isOpen = false,
      cropperId,
      title,
      description,
      applyLabel = "Apply",
      savingLabel = "Saving…",
      cancelLabel = "Cancel",
      closeLabel,
      loadErrorText = "The image could not be loaded.",
      error,
      isSaving = false,
      className = "",
      onCancel,
      onApply,
    } = props

    const cropper = api.getEntity(cropperId)
    const isLoaded = Boolean(cropper?.naturalWidth)
    const shownError = error || (cropper?.hasError ? loadErrorText : null)

    return Dialog.render({
      id,
      isOpen,
      title,
      description,
      closeLabel,
      className: ["iw-crop-dialog", className].filter(Boolean).join(" "),
      onClose: onCancel,
      children: html`
        <div class="iw-crop-dialog-viewport">${api.render(cropperId)}</div>
        ${when(shownError, () =>
          Alert.render({
            severity: "error",
            className: "iw-crop-dialog-error",
            children: shownError,
          }),
        )}
      `,
      actions: html`<div class="iw-crop-dialog-actions">
        ${Button.render({
          children: cancelLabel,
          variant: "ghost",
          shape: "pill",
          size: "sm",
          isDisabled: isSaving,
          onClick: onCancel,
        })}
        ${Button.render({
          children: isSaving ? savingLabel : applyLabel,
          color: "primary",
          shape: "pill",
          size: "sm",
          isDisabled: isSaving || !isLoaded,
          onClick: () => onApply?.(cropper.rect),
        })}
      </div>`,
    })
  },
}
