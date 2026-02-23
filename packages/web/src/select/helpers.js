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
 * Filter options based on searchTerm.
 * Search in label (case-insensitive).
 * @param {SelectOption[]} options
 * @param {string} searchTerm
 * @returns {SelectOption[]}
 */
export function filterOptions(options, searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") {
    return options
  }

  const searchLower = String(searchTerm).toLowerCase().trim()

  return options.filter((option) => {
    const label = getOptionLabel(option)
    return label.toLowerCase().includes(searchLower)
  })
}

/**
 * Check if an option is selected.
 * For single: compare value.
 * For multi: check if it is in the array.
 * @param {SelectOption} option
 * @param {string|number|(string|number)[]} selectedValue
 * @param {boolean} isMulti
 * @returns {boolean}
 */
export function isOptionSelected(option, selectedValue, isMulti) {
  const optionValue = getOptionValue(option)

  if (isMulti && Array.isArray(selectedValue)) {
    return selectedValue.some((val) => val === optionValue)
  }

  return selectedValue === optionValue
}

/**
 * Find the index of an option by value.
 * @param {SelectOption[]} options
 * @param {string|number} value
 * @returns {number}
 */
export function findOptionIndex(options, value) {
  return options.findIndex((option) => getOptionValue(option) === value)
}

/**
 * Group options by a property.
 * Returns: [{label: "Group 1", options: [...]}, ...].
 * @param {SelectOption[]} options
 * @param {string} groupBy
 * @returns {{label: string, options: SelectOption[]}[] | null}
 */
export function groupOptions(options, groupBy) {
  if (!groupBy || typeof groupBy !== "string") {
    return null
  }

  const groups = new Map()

  options.forEach((option) => {
    const groupKey = option[groupBy] ?? "Ungrouped"

    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }

    groups.get(groupKey).push(option)
  })

  return Array.from(groups.entries()).map(([label, options]) => ({
    label,
    options,
  }))
}

/**
 * Normalize an option to the standard format {value, label}.
 * Accepts: string, number, or object {value, label, ...}.
 * @param {SelectOption} option
 * @returns {{value: string|number, label: string}}
 */
export function formatOption(option) {
  if (typeof option === "string" || typeof option === "number") {
    return { value: option, label: String(option) }
  }

  if (typeof option === "object" && option !== null) {
    return {
      value: option.value ?? option,
      label: option.label ?? String(option.value ?? option),
      ...option, // Preserve other properties (disabled, group, etc)
    }
  }

  return { value: option, label: String(option) }
}
