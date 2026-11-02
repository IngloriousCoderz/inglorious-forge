import type { Api, TemplateResult } from "@inglorious/web"

import type { CropRect } from "../controls/image-cropper"

export interface CropDialogProps {
  id?: string
  isOpen?: boolean
  /** The id of the ImageCropper entity to show. */
  cropperId: string
  title?: TemplateResult | string
  description?: TemplateResult | string
  /** Defaults to `"Apply"`. */
  applyLabel?: string
  /** The apply button's text while `isSaving`. Defaults to `"Saving…"`. */
  savingLabel?: string
  /** Defaults to `"Cancel"`. */
  cancelLabel?: string
  /** The close button's accessible name. Defaults to `"Close"`. */
  closeLabel?: string
  /** Shown when the cropper cannot load its image. */
  loadErrorText?: string
  /** An error of the caller's, such as a failed upload. Wins over `loadErrorText`. */
  error?: TemplateResult | string | null
  isSaving?: boolean
  className?: string
  onCancel?: () => void
  /** Receives the cropper's `rect`. */
  onApply?: (rect: CropRect) => void
}

export type CropDialogType = {
  render(props: CropDialogProps, api: Api): TemplateResult
}

export declare const CropDialog: CropDialogType
