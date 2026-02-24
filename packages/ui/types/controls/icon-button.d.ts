import type { TemplateResult, Api } from "@inglorious/web"

export interface IconButtonEntity {
  id?: string
  icon?: string
  label?: string
  iconAfter?: string
  direction?: "row" | "column"
  iconOnly?: boolean
  ariaLabel?: string
  variant?: "default" | "outline" | "ghost"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  fullWidth?: boolean
  type?: "button" | "submit" | "reset" | "menu"
}

export interface IconButtonType {
  render(entity: IconButtonEntity, api: Api): TemplateResult
}

export declare const iconButton: IconButtonType
