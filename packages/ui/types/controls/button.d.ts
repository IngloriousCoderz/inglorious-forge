import type { TemplateResult, Api } from "@inglorious/web"

export interface ButtonEntity {
  id?: string
  type: "button"
  children?: TemplateResult | string | number
  variant?: "default" | "outline" | "ghost"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  shape?: "rectangle" | "pill" | "round" | "square"
  disabled?: boolean
  fullWidth?: boolean
  buttonType?: "button" | "submit" | "reset" | "menu"
  ariaLabel?: string
  ariaPressed?: boolean
  className?: string
  [key: string]: unknown
}

export interface ButtonType {
  render(entity: ButtonEntity, api: Api): TemplateResult
}

export declare const button: ButtonType
