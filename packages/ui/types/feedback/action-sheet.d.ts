import type { TemplateResult } from "@inglorious/web"

export interface ActionSheetAction {
  /** Keeps the action's identity when the list changes. Defaults to `label`. */
  id?: string
  label: string
  /** An `Icon` to show before the label. */
  icon?: TemplateResult
  /** `"error"` for an action that destroys something. Defaults to `"primary"`. */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  isDisabled?: boolean
  /** Runs before the sheet's `onClose`. */
  onClick?: () => void
}

export interface ActionSheetProps {
  id?: string
  isOpen?: boolean
  title?: TemplateResult | string | number
  /** A line under the title, such as what the actions apply to. */
  message?: TemplateResult | string | number
  actions?: ActionSheetAction[]
  /** Defaults to `"Cancel"`. */
  cancelLabel?: string
  /** The close button's accessible name. Defaults to `"Close"`. */
  closeLabel?: string
  className?: string
  /** Called by the cancel button, each action, Esc, the backdrop and a drag down. */
  onClose?: () => void
}

export type ActionSheetType = {
  render(props: ActionSheetProps): TemplateResult
}

export declare const ActionSheet: ActionSheetType
