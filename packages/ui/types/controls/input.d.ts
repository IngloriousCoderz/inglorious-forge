import type { TemplateResult, Api } from "@inglorious/web"

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
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  fullWidth?: boolean
  icon?: string
  iconAfter?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  [key: string]: unknown
}

export interface InputType {
  render(entity: InputProps, api: Api): TemplateResult
}

export declare const input: InputType
