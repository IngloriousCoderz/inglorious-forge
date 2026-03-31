import type { TemplateResult } from "@inglorious/web"

export interface ButtonGroupItem {
  id?: string
  value?: string
  label: string
  children?: TemplateResult | string | number
  isDisabled?: boolean
  variant?: "default" | "outline" | "ghost"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  icon?: string
  iconAfter?: string
  [key: string]: unknown
}

export interface ButtonGroupProps {
  id?: string
  buttons?: ButtonGroupItem[]
  value?: string | string[]
  isMultiple?: boolean
  direction?: "row" | "column"
  isAttached?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  isDisabled?: boolean
  onChange?: (value?: string | string[]) => void
  [key: string]: unknown
}

export interface ButtonGroupType {
  render(props: ButtonGroupProps): TemplateResult
}

export declare const ButtonGroup: ButtonGroupType
