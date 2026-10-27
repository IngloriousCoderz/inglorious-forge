import type { TemplateResult } from "@inglorious/web"

export interface ChipProps {
  id?: string
  children?: TemplateResult | string | number
  /** Shown before the label, such as an `Icon.render(...)`. Decorative. */
  icon?: TemplateResult
  isRemovable?: boolean
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
  size?: "sm" | "md" | "lg"
  shape?: "pill" | "rounded" | "square"
  /**
   * Makes the chip a toggle button, pressed while true, for picking options:
   * `onClick` toggles it. Left out, the chip is a plain label.
   */
  isSelected?: boolean
  /** Only for a chip with `isSelected`. */
  isDisabled?: boolean
  onClick?: () => void
  [key: string]: unknown
}

export type ChipType = {
  render(props: ChipProps): TemplateResult
}

export declare const Chip: ChipType
