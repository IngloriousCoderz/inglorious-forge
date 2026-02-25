import type { TemplateResult, Api } from "@inglorious/web"

export interface ListEntity {
  id?: string
  type?: string
  items?: unknown[]
  children?: TemplateResult | string | number
  ordered?: boolean
  dense?: boolean
  divided?: boolean
  className?: string
  [key: string]: unknown
}

export interface ListType {
  render(entity: ListEntity, api: Api): TemplateResult
  renderItem(
    entity: ListEntity,
    payload: { item: unknown; index: number },
    api: Api,
  ): TemplateResult
}

export declare const list: ListType
