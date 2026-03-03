import type { TemplateResult } from "@inglorious/web"

export type ListItem = unknown

export interface ListProps {
  id?: string
  type?: string
  items?: unknown[]
  children?: TemplateResult | string | number
  isOrdered?: boolean
  isDense?: boolean
  isDivided?: boolean
  className?: string
  onItemClick?: (item: ListItem, index: number) => void
  [key: string]: unknown
}

export interface ListType {
  render(props: ListProps): TemplateResult
  renderItem(
    props: ListProps,
    payload: {
      item: ListItem
      index: number
      onItemClick?: (item: ListItem, index: number) => void
    },
  ): TemplateResult
}

export declare const list: ListType
