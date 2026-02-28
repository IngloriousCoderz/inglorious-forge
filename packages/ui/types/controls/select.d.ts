import type { TemplateResult, Api } from "@inglorious/web"

export type SelectOption =
  | string
  | number
  | {
      value: string | number
      label?: string
      disabled?: boolean
      isDisabled?: boolean
      [key: string]: unknown
    }

export interface SelectEntity {
  id?: string
  type?: string
  name?: string
  value?: unknown
  options?: SelectOption[]
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  fullWidth?: boolean
  isMulti?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  [key: string]: unknown
}

export interface SelectType {
  create(entity: SelectEntity): void
  change(entity: SelectEntity): void
  render(entity: SelectEntity, api: Api): TemplateResult
}

export declare const select: SelectType
