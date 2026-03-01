import type { TemplateResult, Api } from "@inglorious/web"

export interface BadgeProps {
  id?: string
  children?: TemplateResult | string | number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  variant?: "solid" | "outline"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  [key: string]: unknown
}

export interface BadgeType {
  render(entity: BadgeProps, api: Api): TemplateResult
}

export declare const badge: BadgeType
