import type { TemplateResult, Api } from "@inglorious/web"

export interface BadgeEntity {
  id?: string
  children?: TemplateResult | string | number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  variant?: "solid" | "outline"
  size?: "sm" | "md" | "lg"
  [key: string]: unknown
}

export interface BadgeType {
  render(entity: BadgeEntity, api: Api): TemplateResult
}

export declare const badge: BadgeType
