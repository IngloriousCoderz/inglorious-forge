import type { TemplateResult } from "@inglorious/web"

export interface IconButtonProps {
  id?: string
  type?: string
  icon?: string
  label?: string
  iconAfter?: string
  direction?: "row" | "column"
  ariaLabel?: string
  variant?: "default" | "outline" | "ghost"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  isDisabled?: boolean
  isFullWidth?: boolean
  buttonType?: "button" | "submit" | "reset" | "menu"
  onClick?: () => void
}

export interface IconButtonType {
  render(props: IconButtonProps): TemplateResult
}

export declare const iconButton: IconButtonType
