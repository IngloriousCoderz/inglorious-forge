import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface AppBarProps {
  id?: string
  type?: string
  title?: TemplateResult | string | number
  subtitle?: TemplateResult | string | number
  leading?: TemplateResult | string | number
  trailing?: TemplateResult | string | number
  children?: Renderable
  isDense?: boolean
  variant?: "regular" | "dense" | "prominent"
  color?: "default" | "primary" | "secondary" | "transparent" | "inherit"
  isElevated?: boolean
  position?: "static" | "sticky" | "fixed" | "absolute" | "relative"
  placement?: "top" | "bottom"
  className?: string
  [key: string]: unknown
}

export type AppBarType = {
  render(props: AppBarProps): TemplateResult
}

export declare const AppBar: AppBarType
