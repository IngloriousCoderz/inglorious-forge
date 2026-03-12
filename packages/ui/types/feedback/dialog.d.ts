import type { TemplateResult } from "@inglorious/web"

export interface DialogProps {
  id?: string
  type?: string
  isOpen?: boolean
  title?: TemplateResult | string | number
  description?: TemplateResult | string | number
  children?: TemplateResult | string | number
  actions?: TemplateResult | string | number
  className?: string
  onClose?: () => void
  onBackdropClick?: () => void
  [key: string]: unknown
}

export interface DialogType {
  render(props: DialogProps): TemplateResult | null
}

export declare const dialog: DialogType
