import type { TemplateResult, Api } from "@inglorious/web"

export interface CheckboxEntity {
  id?: string
  name?: string
  label?: string
  checked?: boolean
  disabled?: boolean
  required?: boolean
  size?: "sm" | "md" | "lg"
}

export interface CheckboxType {
  render(entity: CheckboxEntity, api: Api): TemplateResult
}

export declare const checkbox: CheckboxType
