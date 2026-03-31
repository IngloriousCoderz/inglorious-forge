import type { TemplateResult } from "@inglorious/web"

export interface CheckboxProps {
  id?: string
  name?: string
  label?: string
  isChecked?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  onChange?: (isChecked: boolean) => void
  [key: string]: unknown
}

export interface CheckboxType {
  render(props: CheckboxProps): TemplateResult
}

export declare const Checkbox: CheckboxType
