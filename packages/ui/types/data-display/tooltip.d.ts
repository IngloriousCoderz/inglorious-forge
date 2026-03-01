import type { TemplateResult, Api } from "@inglorious/web"

export interface TooltipProps {
  id?: string
  children?: TemplateResult | string | number
  content?: TemplateResult | string | number
  position?: "top" | "right" | "bottom" | "left"
  size?: "sm" | "md" | "lg"
  open?: boolean
  maxWidth?: string
  className?: string
  onClick: () => void
  [key: string]: unknown
}

export interface TooltipType {
  render(entity: TooltipProps, api: Api): TemplateResult
}

export declare const tooltip: TooltipType
