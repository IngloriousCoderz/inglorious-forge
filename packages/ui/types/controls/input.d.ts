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
    | "date"
    | "time"
    | "datetime-local"
    | "month"
    | "week"
    | "color"
  value?: string
  placeholder?: string
  label?: string
  /** Names the field for assistive tech when it has no visible `label`. */
  ariaLabel?: string
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

export type InputType = {
  render(props: InputProps): TemplateResult
}

export declare const Input: InputType
