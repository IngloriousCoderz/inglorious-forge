import type { TemplateResult } from "@inglorious/web"

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
  id?: string
  type?: string
  isOpen?: boolean
  items?: MenuItem[]
  isDense?: boolean
  className?: string
  onItemClick?: (value: string | number, item: MenuItem) => void
  [key: string]: unknown
}

export interface MenuType {
  render(props: MenuProps): TemplateResult | null
  renderItem(item: MenuItem, index: number, props: MenuProps): TemplateResult
}

export declare const menu: MenuType
