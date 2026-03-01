/**
 * @typedef {import('../../../types/controls/select.js').SelectProps} SelectEntity
 * @typedef {import('../../../types/controls/select.js').SelectOption} SelectOption
 */

import { filterOptions, formatOption, getOptionValue } from "./helpers.js"

/**
 * Initialize missing select state defaults.
 * @param {SelectEntity} entity
 */
export function create(entity) {
  entity.size ??= "md"
  entity.fullWidth ??= false
  entity.label ??= ""

  entity.isOpen ??= false
  entity.searchTerm ??= ""
  entity.focusedIndex ??= -1

  entity.isMulti ??= false
  entity.selectedValue ??= entity.isMulti ? [] : null

  entity.options ??= []
  entity.options = entity.options.map(formatOption)

  entity.isLoading ??= false
  entity.isDisabled ??= false
  entity.isSearchable ??= false
  entity.isClearable ??= false

  entity.placeholder ??= "Select..."
  entity.noOptionsMessage ??= "No options"
  entity.loadingMessage ??= "Loading..."
}

/** @param {SelectEntity} entity */
export function open(entity) {
  if (entity.isDisabled) return
  entity.isOpen = true

  const filtered = filterOptions(entity.options, entity.searchTerm)
  entity.focusedIndex = filtered.length ? 0 : -1
}

/** @param {SelectEntity} entity */
export function close(entity) {
  entity.isOpen = false
  entity.focusedIndex = -1
}

/** @param {SelectEntity} entity */
export function toggle(entity) {
  if (entity.isOpen) close(entity)
  else open(entity)
}

/**
 * Select an option.
 * @param {SelectEntity} entity
 * @param {SelectOption} option
 */
export function optionSelect(entity, option) {
  if (entity.isDisabled) return

  const normalizedOption = formatOption(option)
  const optionValue = getOptionValue(normalizedOption)

  if (entity.isMulti) {
    const values = Array.isArray(entity.selectedValue)
      ? entity.selectedValue
      : []
    const index = values.indexOf(optionValue)

    if (index === -1) {
      values.push(optionValue)
    } else {
      values.splice(index, 1)
    }

    entity.selectedValue = values
    return
  }

  entity.selectedValue = optionValue
  close(entity)
}

/** @param {SelectEntity} entity */
export function clear(entity) {
  if (entity.isDisabled) return
  entity.selectedValue = entity.isMulti ? [] : null
}

/**
 * @param {SelectEntity} entity
 * @param {string} searchTerm
 */
export function searchChange(entity, searchTerm) {
  entity.searchTerm = searchTerm
  const filtered = filterOptions(entity.options, entity.searchTerm)
  entity.focusedIndex = filtered.length ? 0 : -1
}

/** @param {SelectEntity} entity */
export function focusNext(entity) {
  const filtered = filterOptions(entity.options, entity.searchTerm)
  if (!filtered.length) return
  entity.focusedIndex = Math.min(entity.focusedIndex + 1, filtered.length - 1)
}

/** @param {SelectEntity} entity */
export function focusPrev(entity) {
  entity.focusedIndex = Math.max(entity.focusedIndex - 1, -1)
}

/** @param {SelectEntity} entity */
export function focusFirst(entity) {
  const filtered = filterOptions(entity.options, entity.searchTerm)
  if (filtered.length) entity.focusedIndex = 0
}

/** @param {SelectEntity} entity */
export function focusLast(entity) {
  const filtered = filterOptions(entity.options, entity.searchTerm)
  if (filtered.length) entity.focusedIndex = filtered.length - 1
}

/**
 * Set focused option index.
 * @param {SelectEntity} entity
 * @param {number} index
 */
export function focusSet(entity, index) {
  entity.focusedIndex = Number.isInteger(index) ? index : entity.focusedIndex
}
