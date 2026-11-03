import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface AlertProps {
  id?: string
  type?: string
  title?: TemplateResult | string | number
  description?: TemplateResult | string | number
  children?: Renderable
  severity?: "info" | "success" | "warning" | "error" | "neutral"
  variant?: "filled" | "outlined"
  icon?: TemplateResult | string | number
  action?: TemplateResult | string | number
  onClose?: () => void
  /** The dismiss button's accessible name. Defaults to "Dismiss". */
  dismissLabel?: string
  className?: string
  [key: string]: unknown
}

export type AlertType = {
  render(props: AlertProps): TemplateResult
}

export declare const Alert: AlertType
