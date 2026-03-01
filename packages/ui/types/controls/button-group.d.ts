import type { TemplateResult, Api } from "@inglorious/web"

export interface ButtonGroupItem {
  id?: string
  value?: string
  label: string
  children?: TemplateResult | string | number
  disabled?: boolean
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
  multiple?: boolean
  direction?: "row" | "column"
  attached?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  disabled?: boolean
  onChange?: (value?: string | string[]) => void
  [key: string]: unknown
}

export interface ButtonGroupType {
  render(entity: ButtonGroupProps, api: Api): TemplateResult
}

export declare const buttonGroup: ButtonGroupType
