import type { TemplateResult, Api } from "@inglorious/web"

export interface RatingProps {
  id?: string
  value?: number
  max?: number
  disabled?: boolean
  readonly?: boolean
  symbol?: string
  emptySymbol?: string
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
}

export interface RatingType {
  render(entity: RatingProps, api: Api): TemplateResult
}

export declare const rating: RatingType
