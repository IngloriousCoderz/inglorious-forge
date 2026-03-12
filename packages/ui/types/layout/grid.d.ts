import type { TemplateResult } from "@inglorious/web"

export interface GridProps {
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
  columns?: number
  minColumnWidth?: string
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  align?: "stretch" | "start" | "center" | "end"
  justify?: "stretch" | "start" | "center" | "end"
  isFullWidth?: boolean
  children?: Array<TemplateResult | string | number>
  onClick?: () => void
}

export interface GridType {
  render(props: GridProps): TemplateResult
}

export declare const grid: GridType
