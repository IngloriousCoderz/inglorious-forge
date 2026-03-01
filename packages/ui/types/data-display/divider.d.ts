import type { TemplateResult, Api } from "@inglorious/web"

export interface DividerProps {
  id?: string
  orientation?: "horizontal" | "vertical"
  inset?: boolean
  [key: string]: unknown
}

export interface DividerType {
  render(entity: DividerProps, api: Api): TemplateResult
}

export declare const divider: DividerType
