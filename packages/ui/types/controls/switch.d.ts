import type { TemplateResult, Api } from "@inglorious/web"

export interface SwitchEntity {
  id?: string
  name?: string
  label?: string
  checked?: boolean
  disabled?: boolean
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  [key: string]: unknown
}

export interface SwitchType {
  render(entity: SwitchEntity, api: Api): TemplateResult
}

export declare const switchControl: SwitchType
