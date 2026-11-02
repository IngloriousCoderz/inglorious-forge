import type { TemplateResult } from "@inglorious/web"

import type { ComboboxOption } from "./combobox"

export interface ChipPickerProps {
  /** The fieldset's legend. */
  label?: TemplateResult | string
  hint?: TemplateResult | string
  /** Strings, numbers or `{ value, label, isDisabled }`, as in Combobox. */
  options?: ComboboxOption[]
  /** The values picked. */
  value?: (string | number)[]
  isDisabled?: boolean
  className?: string
  /** Called with the value of the chip pressed, picked or not. */
  onToggle?: (value: string | number) => void
}

export type ChipPickerType = {
  render(props: ChipPickerProps): TemplateResult
}

export declare const ChipPicker: ChipPickerType
