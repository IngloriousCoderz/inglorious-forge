import type { TemplateResult } from "@inglorious/web"

export interface InputProps {
  id?: string
  name?: string
  inputType?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "search"
  value?: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  size?: "sm" | "md" | "lg"
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isFullWidth?: boolean
  icon?: string
  iconAfter?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  [key: string]: unknown
}

export interface InputType {
  render(props: InputProps): TemplateResult
}

export declare const Input: InputType
