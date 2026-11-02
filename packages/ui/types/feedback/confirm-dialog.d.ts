import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface ConfirmDialogProps {
  id?: string
  isOpen?: boolean
  /** The question, such as "Delete this event?". */
  message?: TemplateResult | string | number
  /** Anything more to show under the message, such as an error. */
  children?: Renderable
  confirmLabel: string
  /** The confirm button's text while `isBusy`. Defaults to `confirmLabel`. */
  busyLabel?: string
  /** Defaults to `"Cancel"`. */
  cancelLabel?: string
  /** The close button's accessible name. Defaults to `"Close"`. */
  closeLabel?: string
  /** `"danger"` (default) for an action that cannot be undone, `"primary"` otherwise. */
  tone?: "danger" | "primary"
  /** The action is running: nothing can be pressed and the sheet stays open. */
  isBusy?: boolean
  isDisabled?: boolean
  className?: string
  onConfirm?: () => void
  /** Called by the cancel button, Esc and the backdrop. */
  onCancel?: () => void
}

export type ConfirmDialogType = {
  render(props: ConfirmDialogProps): TemplateResult
}

export declare const ConfirmDialog: ConfirmDialogType
