import type { TemplateResult } from "@inglorious/web"

export interface DividerProps {
  id?: string
  orientation?: "horizontal" | "vertical"
  isInset?: boolean
  [key: string]: unknown
}

export interface DividerType {
  render(props: DividerProps): TemplateResult
}

export declare const divider: DividerType
