import type { TemplateResult } from "@inglorious/web"

export interface RatingProps {
  id?: string
  value?: number
  max?: number
  isDisabled?: boolean
  isReadOnly?: boolean
  symbol?: string
  emptySymbol?: string
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
}

export interface RatingType {
  render(props: RatingProps): TemplateResult
}

export declare const Rating: RatingType
