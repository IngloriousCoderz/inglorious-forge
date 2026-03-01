import type { TemplateResult, Api } from "@inglorious/web"

export interface ChipProps {
  id?: string
  children?: TemplateResult | string | number
  isRemovable?: boolean
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
  size?: "sm" | "md" | "lg"
  shape?: "pill" | "rounded" | "square"
  onClick?: () => void
  [key: string]: unknown
}

export interface ChipType {
  render(entity: ChipProps, api: Api): TemplateResult
}

export declare const chip: ChipType
