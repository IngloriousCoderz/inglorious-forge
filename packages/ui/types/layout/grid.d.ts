import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

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
  children?: Renderable
  onClick?: (event: MouseEvent) => void
}

export type GridType = {
  render(props: GridProps): TemplateResult
}

export declare const Grid: GridType
