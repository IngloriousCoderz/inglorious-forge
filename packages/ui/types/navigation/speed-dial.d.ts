import type { TemplateResult } from "@inglorious/web"

export interface SpeedDialAction {
  id?: string | number
  value?: string | number
  label?: TemplateResult | string | number
  icon?: TemplateResult | string | number
  disabled?: boolean
  onClick?: (value: string | number) => void
  [key: string]: unknown
}

export interface SpeedDialProps {
  id?: string
  type?: string
  open?: boolean
  icon?: TemplateResult | string | number
  ariaLabel?: string
  direction?: "up" | "down" | "left" | "right"
  actions?: SpeedDialAction[]
  onToggle?: (open: boolean) => void
  onAction?: (value: string | number, action: SpeedDialAction) => void
  [key: string]: unknown
}

export interface SpeedDialType {
  render(props: SpeedDialProps): TemplateResult
  renderAction(
    action: SpeedDialAction,
    index: number,
    props: SpeedDialProps,
  ): TemplateResult
}

export declare const speedDial: SpeedDialType
