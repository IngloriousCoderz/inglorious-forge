import type { TemplateResult, Api } from "@inglorious/web"

export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
  [key: string]: unknown
}

export interface RadioGroupProps {
  id?: string
  name?: string
  label?: string
  value?: string
  options?: RadioOption[]
  direction?: "column" | "row"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  disabled?: boolean
  onChange?: (value: string) => void
  [key: string]: unknown
}

export interface RadioGroupType {
  render(entity: RadioGroupProps, api: Api): TemplateResult
}

export declare const radioGroup: RadioGroupType
