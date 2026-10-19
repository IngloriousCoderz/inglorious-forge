import type { TemplateResult } from "@inglorious/web"

export interface SwitchProps {
  id?: string
  name?: string
  label?: string
  isChecked?: boolean
  isDisabled?: boolean
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  onChange?: (value: boolean) => void
  [key: string]: unknown
}

export type SwitchType = {
  render(props: SwitchProps): TemplateResult
}

export declare const Switch: SwitchType
