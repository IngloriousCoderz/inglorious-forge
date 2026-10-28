import type { TemplateResult } from "@inglorious/web"

export interface DialogProps {
  id?: string
  type?: string
  isOpen?: boolean
  /** Modal by default; `false` shows the dialog in place, with the page still usable. */
  isModal?: boolean
  /** Its width: `"sm"`, `"md"` (default) or `"lg"`. */
  size?: "sm" | "md" | "lg"
  /**
   * How it presents itself: `"dialog"` (default) centred, or `"sheet"`, which
   * below 48rem is anchored to the bottom edge at full width, rising from
   * below, and from 48rem is the centred dialog. Either can be modal or not.
   */
  variant?: "dialog" | "sheet"
  title?: TemplateResult | string | number
  description?: TemplateResult | string | number
  children?: TemplateResult | string | number
  actions?: TemplateResult | string | number
  className?: string
  /** The close button's accessible name, for the app's language. Defaults to `"Close"`. */
  closeLabel?: string
  onClose?: () => void
  onBackdropClick?: () => void
  [key: string]: unknown
}

export type DialogType = {
  render(props: DialogProps): TemplateResult
}

export declare const Dialog: DialogType
