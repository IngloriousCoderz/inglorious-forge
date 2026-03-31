import type { TemplateResult } from "@inglorious/web"

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
  render(props: ChipProps): TemplateResult
}

export declare const Chip: ChipType
