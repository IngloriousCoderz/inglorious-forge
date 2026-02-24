import type { TemplateResult, Api } from "@inglorious/web"

export interface SwitchEntity {
  id?: string
  name?: string
  label?: string
  checked?: boolean
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export interface SwitchType {
  render(entity: SwitchEntity, api: Api): TemplateResult
}

export declare const switchControl: SwitchType
