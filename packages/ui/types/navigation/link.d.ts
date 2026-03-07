import type { TemplateResult } from "@inglorious/web"

export interface LinkProps {
  id?: string
  type?: string
  href?: string
  label?: TemplateResult | string | number
  children?: TemplateResult | string | number
  underline?: "always" | "hover" | "none"
  color?: "primary" | "secondary" | "inherit"
  muted?: boolean
  external?: boolean
  className?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface LinkType {
  render(props: LinkProps): TemplateResult
}

export declare const link: LinkType
