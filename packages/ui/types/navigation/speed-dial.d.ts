import type { TemplateResult } from "@inglorious/web"

export interface SpeedDialAction {
  id?: string | number
  value?: string | number
  label?: TemplateResult | string | number
  icon?: TemplateResult | string | number
  isDisabled?: boolean
  onClick?: (value: string | number) => void
  [key: string]: unknown
}

export interface SpeedDialProps {
  id?: string
  type?: string
  isOpen?: boolean
  icon?: TemplateResult | string | number
  ariaLabel?: string
  direction?: "up" | "down" | "left" | "right"
  actions?: SpeedDialAction[]
  /** The name of an action with no label. Defaults to "Speed dial action {index}", counted from 1. */
  formatActionLabel?: (index: number) => string
  /**
   * Called with the new state when the browser opens or closes the actions.
   * Without it, the browser alone keeps the open state and `isOpen` is not
   * applied.
   */
  onToggle?: (isOpen: boolean) => void
  onAction?: (value: string | number, action: SpeedDialAction) => void
  [key: string]: unknown
}

export type SpeedDialType = {
  render(props: SpeedDialProps): TemplateResult
  renderSpeedDial(props: SpeedDialProps): TemplateResult
  renderAction(
    action: SpeedDialAction,
    index: number,
    props: SpeedDialProps,
  ): TemplateResult
}

export declare const SpeedDial: SpeedDialType
