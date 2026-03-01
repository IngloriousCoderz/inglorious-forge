import type { TemplateResult, Api } from "@inglorious/web"

export interface SliderProps {
  id?: string
  name?: string
  label?: string
  value?: number
  min?: number
  max?: number
  step?: number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  disabled?: boolean
  showValue?: boolean
  fullWidth?: boolean
  onChange?: (value: number) => void
  [key: string]: unknown
}

export interface SliderType {
  render(entity: SliderProps, api: Api): TemplateResult
}

export declare const slider: SliderType
