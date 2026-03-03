import type { TemplateResult } from "@inglorious/web"

export type SelectOption =
  | string
  | number
  | {
      value: string | number
      label?: string
      disabled?: boolean
      isDisabled?: boolean
      [key: string]: unknown
    }

export interface SelectProps {
  id?: string
  type?: string
  name?: string
  value?: unknown
  options?: SelectOption[]
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  fullWidth?: boolean
  isMulti?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  [key: string]: unknown
}

export interface SelectType {
  render(props: SelectProps): TemplateResult
}

export declare const select: SelectType
