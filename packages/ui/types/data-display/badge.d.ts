import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface BadgeProps {
  id?: string
  children?: Renderable
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  variant?: "solid" | "outline"
  size?: "sm" | "md" | "lg"
  shape?: "rectangle" | "pill" | "circle" | "square"
  ringWidth?: string
  className?: string
  onClick?: (event: MouseEvent) => void
  [key: string]: unknown
}

export type BadgeType = {
  render(props: BadgeProps): TemplateResult
}

export declare const Badge: BadgeType
