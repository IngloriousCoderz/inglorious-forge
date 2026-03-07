import type { TemplateResult } from "@inglorious/web"

export interface AlertProps {
  id?: string
  type?: string
  title?: TemplateResult | string | number
  description?: TemplateResult | string | number
  children?: TemplateResult | string | number
  severity?: "info" | "success" | "warning" | "error"
  variant?: "filled" | "outlined"
  icon?: TemplateResult | string | number
  action?: TemplateResult | string | number
  onClose?: () => void
  className?: string
  [key: string]: unknown
}

export interface AlertType {
  render(props: AlertProps): TemplateResult
}

export declare const alert: AlertType
