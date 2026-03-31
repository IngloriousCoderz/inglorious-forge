import type { TemplateResult } from "@inglorious/web"

export interface SliderProps {
  id?: string
  name?: string
  label?: string
  value?: number
  min?: number
  max?: number
  step?: number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  isDisabled?: boolean
  isValueVisible?: boolean
  isFullWidth?: boolean
  onChange?: (value: number) => void
  [key: string]: unknown
}

export interface SliderType {
  render(props: SliderProps): TemplateResult
}

export declare const Slider: SliderType
