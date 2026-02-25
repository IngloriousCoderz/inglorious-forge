import type { TemplateResult, Api } from "@inglorious/web"

export interface ChipEntity {
  id?: string
  children?: TemplateResult | string | number
  removable?: boolean
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
  [key: string]: unknown
}

export interface ChipType {
  render(entity: ChipEntity, api: Api): TemplateResult
}

export declare const chip: ChipType
