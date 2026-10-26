import type { TemplateResult } from "@inglorious/web"

import type { ButtonProps } from "../controls/button"

export interface MenuItem {
  id?: string | number
  value?: string | number
  label?: TemplateResult | string | number
  icon?: TemplateResult | string | number
  trailing?: TemplateResult | string | number
  hasDivider?: boolean
  isDisabled?: boolean
  isSelected?: boolean
  onClick?: (value: string | number) => void
  [key: string]: unknown
}

export interface MenuProps {
  /** Required with `trigger`: it links the button to the menu. */
  id?: string
  type?: string
  isOpen?: boolean
  /**
   * Content of a button that opens the menu. With it, the menu is a popover
   * anchored to the button; without it, the menu renders in place while open.
   */
  trigger?: TemplateResult | string | number
  /** Extra props for the trigger button, such as `variant` or `ariaLabel`. */
  triggerProps?: ButtonProps
  /**
   * Called with the new state when the browser opens or closes an anchored
   * menu. Without it, the browser alone keeps the open state and `isOpen` is
   * not applied.
   */
  onToggle?: (isOpen: boolean) => void
  items?: MenuItem[]
  isDense?: boolean
  className?: string
  onItemClick?: (value: string | number, item: MenuItem) => void
  [key: string]: unknown
}

export type MenuType = {
  render(props: MenuProps): TemplateResult | null
  renderTrigger(props: MenuProps): TemplateResult
  renderMenu(props: MenuProps): TemplateResult | null
  renderItem(item: MenuItem, index: number, props: MenuProps): TemplateResult
}

export declare const Menu: MenuType
