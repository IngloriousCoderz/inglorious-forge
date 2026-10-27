import type { TemplateResult } from "@inglorious/web"

export interface SliderProps {
  id?: string
  name?: string
  label?: string
  /** One number, or `[low, high]` for a range with a thumb at each end. */
  value?: number | [number, number]
  min?: number
  max?: number
  step?: number
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  isDisabled?: boolean
  isValueVisible?: boolean
  isFullWidth?: boolean
  /** Draws a tick at every step, for a slider that moves in clear steps. */
  hasMarks?: boolean
  /** The new value, in the shape `value` has: a number, or `[low, high]`. */
  onChange?: (value: number | [number, number]) => void
  [key: string]: unknown
}

export type SliderType = {
  render(props: SliderProps): TemplateResult
}

export declare const Slider: SliderType
