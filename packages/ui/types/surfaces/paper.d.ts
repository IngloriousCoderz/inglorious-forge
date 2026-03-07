import type { TemplateResult } from "@inglorious/web"

export interface PaperProps {
  id?: string
  type?: string
  children?: TemplateResult | string | number
  variant?: "elevated" | "outlined"
  elevation?: number
  padding?: "none" | "sm" | "md" | "lg"
  square?: boolean
  className?: string
  [key: string]: unknown
}

export interface PaperType {
  render(props: PaperProps): TemplateResult
}

export declare const paper: PaperType
