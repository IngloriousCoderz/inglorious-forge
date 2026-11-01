import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface TooltipProps {
  id?: string
  children?: Renderable
  content?: TemplateResult | string | number
  position?: "top" | "right" | "bottom" | "left"
  size?: "sm" | "md" | "lg"
  isOpen?: boolean
  maxWidth?: string
  className?: string
  onClick?: (event: MouseEvent) => void
  [key: string]: unknown
}

export type TooltipType = {
  render(props: TooltipProps): TemplateResult
}

export declare const Tooltip: TooltipType
