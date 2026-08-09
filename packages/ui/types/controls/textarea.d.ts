import type { TemplateResult } from "@inglorious/web"

export interface TextareaProps {
  id?: string
  name?: string
  value?: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  size?: "sm" | "md" | "lg"
  rows?: number
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isFullWidth?: boolean
  isAutoSize?: boolean
  isResizable?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  [key: string]: unknown
}

export interface TextareaType {
  render(props: TextareaProps): TemplateResult
}

export declare const Textarea: TextareaType
