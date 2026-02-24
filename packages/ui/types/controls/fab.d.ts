import type { TemplateResult, Api } from "@inglorious/web"

export interface FabEntity {
  id?: string
  children?: TemplateResult | string | number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  type?: "button" | "submit" | "reset" | "menu"
  extended?: boolean
  ariaLabel?: string
}

export interface FabType {
  render(entity: FabEntity, api: Api): TemplateResult
}

export declare const fab: FabType
