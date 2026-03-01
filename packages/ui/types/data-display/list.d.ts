import type { TemplateResult, Api } from "@inglorious/web"

export type ListItem = unknown

export interface ListProps {
  id?: string
  type?: string
  items?: unknown[]
  children?: TemplateResult | string | number
  ordered?: boolean
  dense?: boolean
  divided?: boolean
  className?: string
  onItemClick?: (item: ListItem, index: number) => void
  [key: string]: unknown
}

export interface ListType {
  render(entity: ListProps, api: Api): TemplateResult
  renderItem(
    entity: ListProps,
    payload: {
      item: ListItem
      index: number
      onItemClick?: (item: ListItem, index: number) => void
    },
    api: Api,
  ): TemplateResult
}

export declare const list: ListType
