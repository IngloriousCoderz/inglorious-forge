import type { TemplateResult, Api } from "@inglorious/web"

export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
  [key: string]: unknown
}

export interface RadioGroupEntity {
  id?: string
  name?: string
  label?: string
  value?: string
  options?: RadioOption[]
  direction?: "column" | "row"
  disabled?: boolean
  [key: string]: unknown
}

export interface RadioGroupType {
  render(entity: RadioGroupEntity, api: Api): TemplateResult
}

export declare const radioGroup: RadioGroupType
