import type { TemplateResult } from "@inglorious/web"

export interface DialogProps {
  id?: string
  type?: string
  isOpen?: boolean
  /** Modal by default; `false` shows the dialog in place, with the page still usable. */
  isModal?: boolean
  title?: TemplateResult | string | number
  description?: TemplateResult | string | number
  children?: TemplateResult | string | number
  actions?: TemplateResult | string | number
  className?: string
  onClose?: () => void
  onBackdropClick?: () => void
  [key: string]: unknown
}

export type DialogType = {
  render(props: DialogProps): TemplateResult
}

export declare const Dialog: DialogType
