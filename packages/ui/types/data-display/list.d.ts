import type { TemplateResult } from "@inglorious/web"

export type ListItem =
  | string
  | number
  | {
      id?: string | number
      label?: TemplateResult | string | number
      primary?: TemplateResult | string | number
      secondary?: TemplateResult | string | number
      icon?: TemplateResult | string | number
      action?: TemplateResult | string | number
      isExpanded?: boolean
      onToggle?: (item: ListItem, path: number[]) => void
      isDisabled?: boolean
      isSelected?: boolean
      hasDivider?: boolean
      onClick?: (item: ListItem, path: number[]) => void
      children?: ListItem[] | TemplateResult | string | number
      [key: string]: unknown
    }

export interface ListProps {
  id?: string
  type?: string
  items?: ListItem[]
  children?: TemplateResult | string | number
  isOrdered?: boolean
  isDense?: boolean
  isDivided?: boolean
  isInset?: boolean
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  path?: number[]
  className?: string
  onItemClick?: (item: ListItem, path: number[]) => void
  onItemToggle?: (item: ListItem, path: number[]) => void
  [key: string]: unknown
}

export interface ListType {
  render(props: ListProps): TemplateResult
  renderItem(
    props: ListProps,
    payload: {
      item: ListItem
      meta: {
        id: string | number
        primary: TemplateResult | string | number
        secondary?: TemplateResult | string | number
        icon?: TemplateResult | string | number
        action?: TemplateResult | string | number
        isExpanded?: boolean
        onToggle?: (item: ListItem, path: number[]) => void
        isDisabled?: boolean
        isSelected?: boolean
        hasDivider?: boolean
        onClick?: (item: ListItem, path: number[]) => void
        children?: ListItem[] | TemplateResult | string | number | null
      }
      index: number
      path: number[]
    },
  ): TemplateResult
}

export declare const list: ListType
