import type { TemplateResult, Api } from "@inglorious/web"

export type ComboboxOption =
  | string
  | number
  | {
      value: string | number
      label?: string
      disabled?: boolean
      isDisabled?: boolean
      [key: string]: unknown
    }

export interface ComboboxEntity {
  id?: string
  type?: string
  label?: string
  options?: ComboboxOption[]

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
  [key: string]: unknown
}

export interface ComboboxType {
  create(entity: ComboboxEntity): void
  render(entity: ComboboxEntity, api: Api): TemplateResult
  open(entity: ComboboxEntity): void
  close(entity: ComboboxEntity): void
  toggle(entity: ComboboxEntity): void
  optionSelect(entity: ComboboxEntity, option: ComboboxOption): void
  clear(entity: ComboboxEntity): void
  searchChange(entity: ComboboxEntity, searchTerm: string): void
  focusNext(entity: ComboboxEntity): void
  focusPrev(entity: ComboboxEntity): void
  focusFirst(entity: ComboboxEntity): void
  focusLast(entity: ComboboxEntity): void
}

export declare const select: ComboboxType
