import type { TemplateResult } from "@inglorious/web"

export interface BadgeProps {
  id?: string
  children?: TemplateResult | string | number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  variant?: "solid" | "outline"
  size?: "sm" | "md" | "lg"
  shape?: "rectangle" | "pill" | "circle" | "square"
  ringWidth?: string
  className?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface BadgeType {
  render(props: BadgeProps): TemplateResult
}

export declare const Badge: BadgeType
