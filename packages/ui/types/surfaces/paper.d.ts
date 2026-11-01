import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface PaperProps {
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
  children?: Renderable
  variant?: "elevated" | "outlined"
  elevation?: number
  padding?: "none" | "sm" | "md" | "lg"
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  className?: string
  [key: string]: unknown
}

export type PaperType = {
  render(props: PaperProps): TemplateResult
}

export declare const Paper: PaperType
