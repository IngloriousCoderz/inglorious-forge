import type { TemplateResult, Api } from "@inglorious/web"

export interface FlexEntity {
  id?: string
  type?: string
  direction?: "row" | "column" | "row-reverse" | "column-reverse"
  wrap?: "nowrap" | "wrap" | "wrap-reverse"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  align?: "stretch" | "start" | "center" | "end" | "baseline"
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  inline?: boolean
  fullWidth?: boolean
  children?: Array<TemplateResult | string | number>
}

export interface FlexType {
  render(entity: FlexEntity, api: Api): TemplateResult
}

export declare const flex: FlexType
