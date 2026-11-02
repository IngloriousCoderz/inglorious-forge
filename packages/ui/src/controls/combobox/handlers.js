/**
 * @typedef {import('../../../types/controls/select.js').SelectProps} SelectEntity
 * @typedef {import('../../../types/controls/select.js').SelectOption} SelectOption
 */

import { formatOption, getOptionValue, visibleOptions } from "./helpers.js"

const NONE = -1

/**
 * Initialize missing select state defaults.
 * @param {SelectEntity} entity
 */
export function create(entity) {
  entity.size ??= "md"
  entity.isFullWidth ??= false
  entity.label ??= ""

  entity.isOpen ??= false
  entity.searchTerm ??= ""
  entity.focusedIndex ??= NONE

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
  entity.focusedIndex = enabledIndex(visibleOptions(entity), 0, 1)
}

/** @param {SelectEntity} entity */
export function close(entity) {
  entity.isOpen = false
  entity.focusedIndex = NONE
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
export function optionSelect(entity, option, api) {
  if (entity.isDisabled) return

  const normalizedOption = formatOption(option)
  if (normalizedOption.isDisabled) return
  const optionValue = getOptionValue(normalizedOption)

  if (normalizedOption.isCreated) {
    entity.searchTerm = ""
    entity.focusedIndex = NONE
  }

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
    notifyChange(entity, api)
    return
  }

  entity.selectedValue = optionValue
  close(entity)
  notifyChange(entity, api)
}

/**
 * @param {SelectEntity} entity
 * @param {unknown} _payload
 * @param {import('@inglorious/web').Api} [api]
 */
export function clear(entity, _payload, api) {
  if (entity.isDisabled) return
  entity.selectedValue = entity.isMulti ? [] : null
  notifyChange(entity, api)
}

/**
 * @param {SelectEntity} entity
 * @param {string} searchTerm
 */
export function searchChange(entity, searchTerm) {
  entity.searchTerm = searchTerm
  entity.focusedIndex = enabledIndex(visibleOptions(entity), 0, 1)
}

/** @param {SelectEntity} entity */
export function focusNext(entity) {
  const next = enabledIndex(visibleOptions(entity), entity.focusedIndex + 1, 1)
  if (next !== NONE) entity.focusedIndex = next
}

/**
 * Before the first enabled option, focus goes back to the search box.
 * @param {SelectEntity} entity
 */
export function focusPrev(entity) {
  entity.focusedIndex = enabledIndex(
    visibleOptions(entity),
    entity.focusedIndex - 1,
    -1,
  )
}

/** @param {SelectEntity} entity */
export function focusFirst(entity) {
  entity.focusedIndex = enabledIndex(visibleOptions(entity), 0, 1)
}

/** @param {SelectEntity} entity */
export function focusLast(entity) {
  const filtered = visibleOptions(entity)
  entity.focusedIndex = enabledIndex(filtered, filtered.length - 1, -1)
}

/**
 * Set focused option index.
 * @param {SelectEntity} entity
 * @param {number} index
 */
export function focusSet(entity, index) {
  entity.focusedIndex = Number.isInteger(index) ? index : entity.focusedIndex
}

/**
 * Sets the value from outside, such as a form being filled with saved data.
 * An empty string, as an empty form field holds, is no value. Unlike a
 * choice, it does not notify `changeEvent`.
 * @param {SelectEntity} entity
 * @param {string | number | (string | number)[] | null} value
 */
export function valueSet(entity, value) {
  if (entity.isMulti) entity.selectedValue = [...(value ?? [])]
  else entity.selectedValue = value === "" ? null : (value ?? null)
  entity.searchTerm = ""
  entity.focusedIndex = NONE
}

/**
 * Replaces the options, such as when they depend on another field.
 * @param {SelectEntity} entity
 * @param {SelectOption[]} options
 */
export function optionsSet(entity, options) {
  entity.options = (options ?? []).map(formatOption)
  entity.searchTerm = ""
  entity.focusedIndex = NONE
}

/**
 * Shows a validation message. The combobox is its own entity, so the form
 * that validates it hands the message over.
 * @param {SelectEntity} entity
 * @param {string | null} error
 */
export function errorSet(entity, error) {
  entity.error = error ?? null
}

function notifyChange(entity, api) {
  if (!entity.changeEvent || !api) return
  const value = entity.isMulti
    ? [...entity.selectedValue]
    : entity.selectedValue
  api.notify(entity.changeEvent, { ...entity.changePayload, value })
}

function enabledIndex(options, start, step) {
  for (let index = start; index >= 0 && index < options.length; index += step) {
    if (!formatOption(options[index]).isDisabled) return index
  }
  return NONE
}
