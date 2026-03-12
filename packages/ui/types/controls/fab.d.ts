import type { TemplateResult } from "@inglorious/web"

export interface FabProps {
  id?: string
  children?: TemplateResult | string | number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  isDisabled?: boolean
  type?: "button" | "submit" | "reset" | "menu"
  isExtended?: boolean
  ariaLabel?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface FabType {
  render(props: FabProps): TemplateResult
}

export declare const fab: FabType
