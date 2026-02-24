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
  label?: string
  options?: SelectOption[]

  isOpen?: boolean
  searchTerm?: string
  focusedIndex?: number

  isMulti?: boolean
  selectedValue?: string | number | (string | number)[] | null

  isLoading?: boolean
  isDisabled?: boolean
  isSearchable?: boolean
  isClearable?: boolean

  placeholder?: string
  noOptionsMessage?: string
  loadingMessage?: string

  fullWidth?: boolean
  size?: "sm" | "md" | "lg"
}

export interface SelectType {
  create(entity: SelectEntity): void
  render(entity: SelectEntity, api: Api): TemplateResult
  open(entity: SelectEntity): void
  close(entity: SelectEntity): void
  toggle(entity: SelectEntity): void
  optionSelect(entity: SelectEntity, option: SelectOption): void
  clear(entity: SelectEntity): void
  searchChange(entity: SelectEntity, searchTerm: string): void
  focusNext(entity: SelectEntity): void
  focusPrev(entity: SelectEntity): void
  focusFirst(entity: SelectEntity): void
  focusLast(entity: SelectEntity): void
}

export declare const select: SelectType
