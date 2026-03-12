import type { TemplateResult } from "@inglorious/web"

export interface ButtonProps {
  id?: string
  type: "button"
  children?: TemplateResult | string | number
  variant?: "default" | "outline" | "ghost"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  shape?: "rectangle" | "pill" | "round" | "square"
  isDisabled?: boolean
  isPressed?: boolean
  isFullWidth?: boolean
  buttonType?: "button" | "submit" | "reset" | "menu"
  ariaLabel?: string
  isAriaPressed?: boolean
  className?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface ButtonType {
  render(props: ButtonProps): TemplateResult
}

export declare const button: ButtonType
