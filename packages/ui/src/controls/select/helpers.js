/**
 * @typedef {import('../../../types/controls/select').SelectOption} SelectOption
 */

/**
 * Get the value of an option.
 * @param {SelectOption} option
 * @returns {string|number}
 */
export function getOptionValue(option) {
  if (typeof option === "object" && option !== null && "value" in option) {
    return option.value
  }

  return option
}

/**
 * Get the label of an option.
 * @param {SelectOption} option
 * @returns {string}
 */
export function getOptionLabel(option) {
  if (typeof option === "object" && option !== null && "label" in option) {
    return String(option.label)
  }

  if (typeof option === "object" && option !== null && "value" in option) {
    return String(option.value)
  }

  return String(option)
}

/**
 * Check whether an option is selected.
 * @param {SelectOption} option
 * @param {string|number|(string|number)[]|null} selectedValue
 * @param {boolean} isMulti
 * @returns {boolean}
 */
export function isOptionSelected(option, selectedValue, isMulti) {
  const optionValue = getOptionValue(option)

  if (isMulti && Array.isArray(selectedValue)) {
    return selectedValue.some((value) => value === optionValue)
  }

  return selectedValue === optionValue
}

/**
 * Normalize option to object shape used in rendering/handlers.
 * @param {SelectOption} option
 * @returns {{ value: string|number, label: string, isDisabled?: boolean }}
 */
export function formatOption(option) {
  if (typeof option === "string" || typeof option === "number") {
    return { value: option, label: String(option) }
  }

  if (typeof option === "object" && option !== null) {
    return {
      value: option.value ?? option,
      label: option.label ?? String(option.value ?? option),
      isDisabled: option.isDisabled ?? option.disabled ?? false,
      ...option,
    }
  }

  return { value: String(option), label: String(option) }
}
