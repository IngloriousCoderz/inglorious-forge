import type { TemplateResult, Api } from "@inglorious/web"

export interface DividerEntity {
  id?: string
  orientation?: "horizontal" | "vertical"
  inset?: boolean
  [key: string]: unknown
}

export interface DividerType {
  render(entity: DividerEntity, api: Api): TemplateResult
}

export declare const divider: DividerType
