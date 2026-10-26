import type { TemplateResult } from "@inglorious/web"

export interface RatingProps {
  id?: string
  /** Groups the radios and names the value in a form. Falls back to `id`. */
  name?: string
  value?: number
  max?: number
  isDisabled?: boolean
  isReadOnly?: boolean
  symbol?: string
  emptySymbol?: string
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
  /** Names the group for assistive tech. Defaults to "Rating". */
  ariaLabel?: string
}

export type RatingType = {
  render(props: RatingProps): TemplateResult
}

export declare const Rating: RatingType
