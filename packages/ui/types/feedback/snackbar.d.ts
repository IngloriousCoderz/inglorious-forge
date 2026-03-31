import type { TemplateResult } from "@inglorious/web"

export interface SnackbarProps {
  id?: string
  type?: string
  isOpen?: boolean
  message?: TemplateResult | string | number
  action?: TemplateResult | string | number
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right"
  className?: string
  onClose?: () => void
  [key: string]: unknown
}

export interface SnackbarType {
  render(props: SnackbarProps): TemplateResult | null
}

export declare const Snackbar: SnackbarType
