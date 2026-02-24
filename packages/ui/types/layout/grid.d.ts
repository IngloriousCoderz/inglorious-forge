import type { TemplateResult, Api } from "@inglorious/web"

export interface GridEntity {
  id?: string
  type?: string
  columns?: number
  minColumnWidth?: string
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  align?: "stretch" | "start" | "center" | "end"
  justify?: "stretch" | "start" | "center" | "end"
  fullWidth?: boolean
  children?: Array<TemplateResult | string | number>
}

export interface GridType {
  render(entity: GridEntity, api: Api): TemplateResult
}

export declare const grid: GridType
