import type { TemplateResult, Api } from "@inglorious/web"

export type ComboboxOption =
  | string
  | number
  | {
      value: string | number
      label?: string
      isDisabled?: boolean
      [key: string]: unknown
    }

export interface ComboboxProps {
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

  isFullWidth?: boolean
  size?: "sm" | "md" | "lg"
  onToggle?: () => void
  onClear?: () => void
  onClose?: () => void
  onSearchChange?: (value: string) => void
  onFocusSet?: (index: number) => void
  onFocusNext?: () => void
  onFocusPrev?: () => void
  onFocusFirst?: () => void
  onFocusLast?: () => void
  onOptionSelect?: (option: ComboboxOption) => void
  onChange?: (option: ComboboxOption) => void
  [key: string]: unknown
}

export interface ComboboxType {
  create(entity: ComboboxProps): void
  render(entity: ComboboxProps, api: Api): TemplateResult
  renderCombobox(props: ComboboxProps): TemplateResult
  open(entity: ComboboxProps): void
  close(entity: ComboboxProps): void
  toggle(entity: ComboboxProps): void
  optionSelect(entity: ComboboxProps, option: ComboboxOption): void
  clear(entity: ComboboxProps): void
  searchChange(entity: ComboboxProps, searchTerm: string): void
  focusNext(entity: ComboboxProps): void
  focusPrev(entity: ComboboxProps): void
  focusFirst(entity: ComboboxProps): void
  focusLast(entity: ComboboxProps): void
}

export declare const combobox: ComboboxType
