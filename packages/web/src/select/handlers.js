/* eslint-disable no-magic-numbers */

import { filterOptions, getOptionValue } from "./helpers"

/**
 * @typedef {import('../../types/select').SelectEntity} SelectEntity
 * @typedef {import('../../types/select').SelectOption} SelectOption
 */

/**
 * Resets the select entity with default state.
 * @param {SelectEntity} entity
 */
export function create(entity) {
  initSelect(entity)
}

/**
 * Opens the select dropdown.
 * @param {SelectEntity} entity
 */
export function open(entity) {
  openSelect(entity)
}

/**
 * Closes the select dropdown.
 * @param {SelectEntity} entity
 */
export function close(entity) {
  closeSelect(entity)
}

/**
 * Toggles the select dropdown open/closed state.
 * @param {SelectEntity} entity
 */
export function toggle(entity) {
  if (entity.isOpen) {
    closeSelect(entity)
  } else {
    openSelect(entity)
  }
}

/**
 * Selects an option.
 * @param {SelectEntity} entity
 * @param {SelectOption} option
 */
export function optionSelect(entity, option) {
  if (entity.isDisabled) return

  const optionValue = getOptionValue(option)

  if (entity.isMulti) {
    // Multi-select: add or remove from array
    const index = entity.selectedValue.indexOf(optionValue)

    if (index === -1) {
      entity.selectedValue.push(optionValue)
    } else {
      entity.selectedValue.splice(index, 1)
    }
  } else {
    // Single select: substitute value and close
    entity.selectedValue = optionValue
    closeSelect(entity)
  }
}

/**
 * Clears the current selection.
 * @param {SelectEntity} entity
 */
export function clear(entity) {
  if (entity.isDisabled) return

  entity.selectedValue = entity.isMulti ? [] : null
}

/**
 * Updates the search term and filters options.
 * @param {SelectEntity} entity
 * @param {string} searchTerm
 */
export function searchChange(entity, searchTerm) {
  entity.searchTerm = searchTerm

  if (entity.isRemote) {
    entity.isLoading = true
    entity.error = null
    return
  }

  const filteredOptions = filterOptions(entity.options, entity.searchTerm)

  entity.focusedIndex = filteredOptions.length ? 0 : -1
}

/**
 * Moves focus to the next option.
 * @param {SelectEntity} entity
 */
export function focusNext(entity) {
  const filteredOptions = filterOptions(entity.options, entity.searchTerm)

  if (!filteredOptions.length) return

  entity.focusedIndex = Math.min(
    entity.focusedIndex + 1,
    filteredOptions.length - 1,
  )
}

/**
 * Moves focus to the previous option.
 * @param {SelectEntity} entity
 */
export function focusPrev(entity) {
  entity.focusedIndex = Math.max(entity.focusedIndex - 1, -1)
}

/**
 * Moves focus to the first option.
 * @param {SelectEntity} entity
 */
export function focusFirst(entity) {
  const filteredOptions = filterOptions(entity.options, entity.searchTerm)

  if (filteredOptions.length) {
    entity.focusedIndex = 0
  }
}

/**
 * Moves focus to the last option.
 * @param {SelectEntity} entity
 */
export function focusLast(entity) {
  const filteredOptions = filterOptions(entity.options, entity.searchTerm)
  if (filteredOptions.length) {
    entity.focusedIndex = filteredOptions.length - 1
  }
}

function initSelect(entity) {
  // Dropdown state
  entity.isOpen ??= false
  entity.searchTerm ??= ""
  entity.focusedIndex ??= -1

  // Selected values
  entity.isMulti ??= false
  entity.selectedValue ??= entity.isMulti ? [] : null

  // Options
  entity.options ??= []

  // States
  entity.isLoading ??= false
  entity.error ??= null
  entity.isDisabled ??= false
  entity.isSearchable ??= true
  entity.isClearable ??= true
  entity.isCreatable ??= false

  // Messages
  entity.placeholder ??= "Select..."
  entity.noOptionsMessage ??= "No options"
  entity.loadingMessage ??= "Loading..."

  // Group by
  entity.groupBy ??= null
}

function closeSelect(entity) {
  entity.isOpen = false
  entity.focusedIndex = -1
}

function openSelect(entity) {
  if (entity.isDisabled) return

  entity.isOpen = true

  // If searchable, the input will be focused during rendering
  // Reset focusedIndex
  entity.focusedIndex = -1

  const filteredOptions = filterOptions(entity.options, entity.searchTerm)

  // if there are no filtered options and not loading, focus the first option
  if (filteredOptions.length && !entity.isLoading) {
    entity.focusedIndex = 0
  }
}
