import type { TemplateResult, Api } from "@inglorious/web"

export type TypographyVariant =
  | "body"
  | "h1"
  | "h2"
  | "h3"
  | "caption"
  | "overline"

export interface TypographyProps {
  id?: string
  children?: TemplateResult | string | number
  variant?: TypographyVariant
  align?: "left" | "center" | "right"
  weight?: string | number
  color?: string
  noWrap?: boolean
  gutterBottom?: boolean
  className?: string
  [key: string]: unknown
}

export interface TypographyType {
  render(entity: TypographyProps, api: Api): TemplateResult
}

export declare const typography: TypographyType
