import type { TemplateResult, Api } from "@inglorious/web"

export interface ButtonEntity {
  id?: string
  label?: string
  variant?: "default" | "outline" | "ghost"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  fullWidth?: boolean
  type?: "button" | "submit" | "reset" | "menu"
  icon?: string
  iconAfter?: string
}

export interface ButtonType {
  render(entity: ButtonEntity, api: Api): TemplateResult
  click(entity: ButtonEntity, payload: unknown, api: Api): void
}

export declare const button: ButtonType
