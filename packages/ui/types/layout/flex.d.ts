import type { TemplateResult, Api } from "@inglorious/web"

export interface FlexProps {
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
  onClick?: () => void
}

export interface FlexType {
  render(entity: FlexProps, api: Api): TemplateResult
}

export declare const flex: FlexType
