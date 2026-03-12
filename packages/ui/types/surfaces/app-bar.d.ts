import type { TemplateResult } from "@inglorious/web"

export interface AppBarProps {
  id?: string
  type?: string
  title?: TemplateResult | string | number
  subtitle?: TemplateResult | string | number
  leading?: TemplateResult | string | number
  trailing?: TemplateResult | string | number
  children?: TemplateResult | string | number
  isDense?: boolean
  variant?: "regular" | "dense" | "prominent"
  color?: "default" | "primary" | "secondary" | "transparent" | "inherit"
  isElevated?: boolean
  position?: "static" | "sticky" | "fixed" | "absolute" | "relative"
  placement?: "top" | "bottom"
  className?: string
  [key: string]: unknown
}

export interface AppBarType {
  render(props: AppBarProps): TemplateResult
}

export declare const appBar: AppBarType
