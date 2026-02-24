import type { TemplateResult, Api } from "@inglorious/web"

export interface RatingEntity {
  id?: string
  value?: number
  max?: number
  disabled?: boolean
  readonly?: boolean
  symbol?: string
  emptySymbol?: string
  size?: "sm" | "md" | "lg"
}

export interface RatingType {
  render(entity: RatingEntity, api: Api): TemplateResult
}

export declare const rating: RatingType
