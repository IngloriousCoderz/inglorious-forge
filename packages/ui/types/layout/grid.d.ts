import type { TemplateResult } from "@inglorious/web"

export interface GridProps {
  id?: string
  type?: string
  columns?: number
  minColumnWidth?: string
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  align?: "stretch" | "start" | "center" | "end"
  justify?: "stretch" | "start" | "center" | "end"
  fullWidth?: boolean
  children?: Array<TemplateResult | string | number>
  onClick?: () => void
}

export interface GridType {
  render(props: GridProps): TemplateResult
}

export declare const grid: GridType
