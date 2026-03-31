import type { TemplateResult } from "@inglorious/web"

export interface FlexProps {
  id?: string
  type?: string
  element?:
    | "div"
    | "section"
    | "main"
    | "header"
    | "footer"
    | "nav"
    | "aside"
    | "article"
  direction?: "row" | "column" | "row-reverse" | "column-reverse"
  wrap?: "nowrap" | "wrap" | "wrap-reverse"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  align?: "stretch" | "start" | "center" | "end" | "baseline"
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  isInline?: boolean
  isFullWidth?: boolean
  children?: Array<TemplateResult | string | number>
  onClick?: () => void
}

export interface FlexType {
  render(props: FlexProps): TemplateResult
}

export declare const Flex: FlexType
