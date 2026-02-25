import type { TemplateResult, Api } from "@inglorious/web"

export interface IconEntity {
  id?: string
  children?: TemplateResult | string | number
  size?: "sm" | "md" | "lg"
  color?: string
  [key: string]: unknown
}

export interface IconType {
  render(entity: IconEntity, api: Api): TemplateResult
}

export declare const icon: IconType
