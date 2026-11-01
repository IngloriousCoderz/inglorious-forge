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
 * Filter options based on search term.
 * @param {SelectOption[]} options
 * @param {string} searchTerm
 * @returns {SelectOption[]}
 */
export function filterOptions(options, searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") {
    return options
  }

  const searchLower = String(searchTerm).toLowerCase().trim()

  return options.filter((option) =>
    optionTexts(option).some((text) => text.includes(searchLower)),
  )
}

/**
 * The options the dropdown lists: those matching the search, then, on a
 * creatable combobox, one to add the typed term unless it is already known.
 * @param {{ options?: SelectOption[], searchTerm?: string, selectedValue?: string|number|(string|number)[]|null, isCreatable?: boolean, formatCreateLabel?: (term: string) => string }} props
 * @returns {SelectOption[]}
 */
export function visibleOptions({
  options = [],
  searchTerm,
  selectedValue,
  isCreatable = false,
  formatCreateLabel = (term) => `Add "${term}"`,
}) {
  const filtered = filterOptions(options, searchTerm)
  const term = String(searchTerm ?? "").trim()
  if (!isCreatable || !term) return filtered

  const key = term.toLowerCase()
  const isKnown =
    [selectedValue]
      .flat()
      .some((value) => String(value).toLowerCase() === key) ||
    options.some(
      (option) =>
        !formatOption(option).isDisabled &&
        (optionTexts(option).includes(key) ||
          String(getOptionValue(option)).toLowerCase() === key),
    )
  if (isKnown) return filtered

  return [
    ...filtered,
    { value: term, label: formatCreateLabel(term), isCreated: true },
  ]
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

/**
 * What a search looks through: the label and the option's keywords, lowercased.
 * @param {SelectOption} option
 * @returns {string[]}
 */
function optionTexts(option) {
  return [getOptionLabel(option), ...(option?.keywords ?? [])].map((text) =>
    text.toLowerCase(),
  )
}
