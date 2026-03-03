import type { TemplateResult } from "@inglorious/web"

export interface DividerProps {
  id?: string
  orientation?: "horizontal" | "vertical"
  inset?: boolean
  [key: string]: unknown
}

export interface DividerType {
  render(props: DividerProps): TemplateResult
}

export declare const divider: DividerType
