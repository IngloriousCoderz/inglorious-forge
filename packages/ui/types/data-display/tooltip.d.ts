import type { TemplateResult, Api } from "@inglorious/web"

export interface TooltipEntity {
  id?: string
  children?: TemplateResult | string | number
  content?: TemplateResult | string | number
  position?: "top" | "right" | "bottom" | "left"
  size?: "sm" | "md" | "lg"
  open?: boolean
  maxWidth?: string
  className?: string
  [key: string]: unknown
}

export interface TooltipType {
  render(entity: TooltipEntity, api: Api): TemplateResult
}

export declare const tooltip: TooltipType
