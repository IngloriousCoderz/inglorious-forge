/**
 * @typedef {import('../../../types/data-display/data-grid').DataGridEntity} DataGridEntity
 * @typedef {import('../../../types/data-display/data-grid').Column} Column
 */

import { html } from "@inglorious/web"

import { filterInput } from "./components/filters/input.js"
import { filterRange } from "./components/filters/range.js"
import { filterSelect } from "./components/filters/select.js"
import { currentPageInput } from "./components/pagination/current-page-input.js"
import { firstPageButton } from "./components/pagination/first-page-button.js"
import { lastPageButton } from "./components/pagination/last-page-button.js"
import { nextPageButton } from "./components/pagination/next-page-button.js"
import { pageSizeSelect } from "./components/pagination/page-size-select.js"
import { prevPageButton } from "./components/pagination/prev-page-button.js"
import { searchbarInput } from "./components/searchbar-input.js"
import {
  getPaginationInfo,
  getRowKeyValue,
  getRows,
  getTotalRows,
} from "./helpers.js"

const RANGE_TYPE = {
  range: "number",
  date: "date",
  time: "time",
  datetime: "datetime-local",
}

export function init(entity, payload, api) {
  api.setType("dataGridFilterInput", filterInput)
  api.setType("dataGridFilterRange", filterRange)
  api.setType("dataGridFilterSelect", filterSelect)
  api.setType("dataGridSearchbarInput", searchbarInput)

  api.setType("dataGridFirstPageButton", firstPageButton)
  api.setType("dataGridPrevPageButton", prevPageButton)
  api.setType("dataGridCurrentPageInput", currentPageInput)
  api.setType("dataGridNextPageButton", nextPageButton)
  api.setType("dataGridLastPageButton", lastPageButton)

  api.setType("dataGridPageSizeSelect", pageSizeSelect)
}

/**
 * Resets the table entity with default state.
 * @param {DataGridEntity} entity
 */
export function create(entity, _, api) {
  initTable(entity)
  addComponents(entity, api)
}

export function destroy(entity, _, api) {
  removeComponents(entity, api)
}

/**
 * Toggles sorting for a column.
 * @param {DataGridEntity} entity
 * @param {string} columnId
 */
export function sortChange(entity, columnId) {
  const column = entity.columns.find((c) => c.id === columnId)
  if (!column?.isSortable) return

  const existingIndex = entity.sorts.findIndex((s) => s.column === columnId)

  if (existingIndex !== -1) {
    // Toggle direction
    const existing = entity.sorts[existingIndex]
    if (existing.direction === "asc") {
      existing.direction = "desc"
    } else {
      // Remove from sort if going from desc back to nothing
      entity.sorts.splice(existingIndex, 1)
    }
  } else {
    // Add new sort
    entity.sorts.push({ column: columnId, direction: "asc" })
  }

  if (entity.pagination) {
    entity.pagination.page = 0
  }
}

/**
 * Clears all sorts.
 * @param {DataGridEntity} entity
 */
export function sortsClear(entity) {
  entity.sorts = []
}

/**
 * Updates a filter value for a column.
 * @param {DataGridEntity} entity
 * @param {{ columnId: string, value: any }} payload
 */
export function filterChange(entity, { columnId, value }) {
  if (value == null || value === "") {
    delete entity.filters[columnId]
  } else {
    entity.filters[columnId] = value
  }

  if (entity.pagination) {
    entity.pagination.page = 0
  }
}

/**
 * Clears all filters.
 * @param {DataGridEntity} entity
 */
export function filtersClear(entity) {
  entity.filters = {}

  if (entity.pagination) {
    entity.pagination.page = 0
  }
}

/**
 * Updates the search term.
 * @param {DataGridEntity} entity
 * @param {string} search
 */
export function searchChange(entity, search) {
  entity.search.value = search

  if (entity.pagination) {
    entity.pagination.page = 0
  }
}

/**
 * Changes the current page.
 * @param {DataGridEntity} entity
 * @param {number} page
 */
export function pageChange(entity, page) {
  if (!entity.pagination) return

  const totalPages = Math.ceil(
    getTotalRows(entity) / entity.pagination.pageSize,
  )
  entity.pagination.page = Math.max(0, Math.min(page, totalPages - 1))
}

/**
 * Moves to the next page.
 * @param {DataGridEntity} entity
 */
export function pageNext(entity) {
  if (!entity.pagination) return
  const totalPages = Math.ceil(
    getTotalRows(entity) / entity.pagination.pageSize,
  )
  entity.pagination.page = Math.min(entity.pagination.page + 1, totalPages - 1)
}

/**
 * Moves to the previous page.
 * @param {DataGridEntity} entity
 */
export function pagePrev(entity) {
  if (!entity.pagination) return
  entity.pagination.page = Math.max(entity.pagination.page - 1, 0)
}

/**
 * Changes the page size.
 * @param {DataGridEntity} entity
 * @param {number} pageSize
 */
export function pageSizeChange(entity, pageSize) {
  if (!entity.pagination) return

  entity.pagination.pageSize = pageSize
  entity.pagination.page = 0
}

/**
 * Selects a row.
 * @param {DataGridEntity} entity
 * @param {string|number} rowId
 */
export function rowSelect(entity, rowId) {
  if (!entity.isMultiSelect) {
    entity.selection = []
  }

  if (!entity.selection.includes(rowId)) {
    entity.selection.push(rowId)
  }
}

/**
 * Deselects a row.
 * @param {DataGridEntity} entity
 * @param {string|number} rowId
 */
export function rowDeselect(entity, rowId) {
  const index = entity.selection.indexOf(rowId)
  if (index !== -1) {
    entity.selection.splice(index, 1)
  }
}

/**
 * Toggles row selection.
 * @param {DataGridEntity} entity
 * @param {string|number} rowId
 */
export function rowToggle(entity, rowId) {
  const index = entity.selection.indexOf(rowId)

  if (index === -1) {
    if (!entity.isMultiSelect) {
      entity.selection = [rowId] // Replace entirely
    } else {
      entity.selection.push(rowId)
    }
  } else {
    entity.selection.splice(index, 1)
  }
}

/**
 * Toggles selection of all currently visible rows.
 * @param {DataGridEntity} entity
 */
export function rowsToggleAll(entity) {
  const rows = getRows(entity)
  const allSelected = rows.every((row) =>
    entity.selection.includes(getRowKeyValue(entity, row)),
  )

  if (allSelected) {
    // Deselect all visible
    rows.forEach((row) => {
      const rowId = getRowKeyValue(entity, row)
      const index = entity.selection.indexOf(rowId)
      if (index !== -1) entity.selection.splice(index, 1)
    })
  } else {
    // Select all visible
    rows.forEach((row) => {
      const rowId = getRowKeyValue(entity, row)
      if (!entity.selection.includes(rowId)) {
        entity.selection.push(rowId)
      }
    })
  }
}

/**
 * Selects all currently visible rows.
 * @param {DataGridEntity} entity
 */
export function rowsSelectAll(entity) {
  const rows = getRows(entity)
  rows.forEach((row) => {
    const rowId = getRowKeyValue(entity, row)
    if (!entity.selection.includes(rowId)) {
      entity.selection.push(rowId)
    }
  })
}

/**
 * Clears all row selections.
 * @param {DataGridEntity} entity
 */
export function selectionClear(entity) {
  entity.selection.length = 0
}

/**
 * Initializes the table state.
 * @param {DataGridEntity} entity
 */
function initTable(entity) {
  entity.rows ??= []
  entity.rowId ??= "id"

  // Auto-generate columns from first data item if not provided
  if (!entity.columns && entity.rows.length) {
    const [firstRow] = entity.rows

    entity.columns = Object.keys(firstRow).map((key) => {
      const value = firstRow[key]
      const type = getDefaultColumnType(value)
      const filter = getDefaultColumnFilter(type)

      return {
        id: key,
        title: capitalize(key),
        type,
        isSortable: false,
        isFilterable: false,
        filter,
        width: getDefaultColumnWidth(filter.type),
      }
    })
  } else {
    entity.columns ??= []
    entity.columns.forEach((column) => {
      column.title ??= capitalize(column.id)
      column.type ??= getDefaultColumnType()
      column.filter ??= getDefaultColumnFilter(column.type)
      column.width ??= getDefaultColumnWidth(column.filter.type)
    })
  }

  // State
  entity.sorts ??= []
  entity.filters ??= {}
  entity.search ??= null
  if (entity.search) {
    entity.search.value ??= ""
  }
  entity.selection ??= []

  entity.pagination ??= null
  if (entity.pagination) {
    entity.pagination.page ??= 0
  }

  assertRowKeys(entity)
}

function addComponents(entity, api) {
  entity.columns.forEach((column) => {
    if (!column.isFilterable) {
      return
    }

    if (column.filter.type === "select") {
      api.notify("add", {
        id: `${entity.id}-filter-${column.id}`,
        type: "dataGridFilterSelect",
        name: column.id,
        multiple: column.filter.isMultiple,
        autocomplete: "off",
        selectedValue: entity.filters[column.id] ?? "",
        options: column.filter.options,
        size: "sm",
        fullWidth: true,
        _owner: entity.id,
      })
    } else if (column.filter.type === "number") {
      api.notify("add", {
        id: `${entity.id}-filter-${column.id}`,
        type: "dataGridFilterInput",
        name: column.id,
        inputType: "number",
        placeholder: column.filter.placeholder ?? "=",
        size: "sm",
        fullWidth: true,
        _owner: entity.id,
      })
    } else if (
      ["range", "date", "time", "datetime"].includes(column.filter.type)
    ) {
      api.notify("add", {
        id: `${entity.id}-filter-${column.id}Min`,
        type: "dataGridFilterRange",
        name: `${column.id}Min`,
        inputType: RANGE_TYPE[column.filter.type],
        placeholder: column.filter.placeholder ?? "≥",
        size: "sm",
        fullWidth: true,
        _owner: entity.id,
        _column: column.id,
        _key: "min",
      })
      api.notify("add", {
        id: `${entity.id}-filter-${column.id}Max`,
        type: "dataGridFilterRange",
        name: `${column.id}Max`,
        inputType: RANGE_TYPE[column.filter.type],
        placeholder: column.filter.placeholder ?? "≤",
        size: "sm",
        fullWidth: true,
        _owner: entity.id,
        _column: column.id,
        _key: "max",
      })
    } else {
      api.notify("add", {
        id: `${entity.id}-filter-${column.id}`,
        type: "dataGridFilterInput",
        name: column.id,
        inputType: "text",
        placeholder: column.filter.placeholder ?? "Contains...",
        size: "sm",
        fullWidth: true,
        _owner: entity.id,
      })
    }
  })

  if (entity.search) {
    api.notify("add", {
      id: `${entity.id}-searchbarInput`,
      type: "dataGridSearchbarInput",
      size: "sm",
      fullWidth: true,
      name: "search",
      inputType: "text",
      placeholder: entity.search.placeholder ?? "Fuzzy search...",
      value: entity.search.value,
      _owner: entity.id,
    })
  }

  api.notify("add", {
    id: `${entity.id}-firstPageButton`,
    type: "dataGridFirstPageButton",
    color: "secondary",
    size: "sm",
    children: html`|&#10094;`,
    _owner: entity.id,
  })

  api.notify("add", {
    id: `${entity.id}-prevPageButton`,
    type: "dataGridPrevPageButton",
    color: "secondary",
    size: "sm",
    children: html`&#10094;`,
    _owner: entity.id,
  })

  if (entity.pagination) {
    const pagination = getPaginationInfo(entity)

    api.notify("add", {
      id: `${entity.id}-currentPageInput`,
      type: "dataGridCurrentPageInput",
      name: "page",
      size: "sm",
      inputType: "number",
      min: 1,
      max: pagination.totalPages,
      _owner: entity.id,
    })

    api.notify("add", {
      id: `${entity.id}-nextPageButton`,
      type: "dataGridNextPageButton",
      color: "secondary",
      size: "sm",
      children: html`&#10095;`,
      _owner: entity.id,
    })

    api.notify("add", {
      id: `${entity.id}-lastPageButton`,
      type: "dataGridLastPageButton",
      color: "secondary",
      size: "sm",
      children: html`&#10095;|`,
      _owner: entity.id,
    })

    api.notify("add", {
      id: `${entity.id}-pageSizeSelect`,
      type: "dataGridPageSizeSelect",
      size: "sm",
      selectedValue: pagination.pageSize,
      options: [10, 20, 30],
      _owner: entity.id,
    })
  }
}

function removeComponents(entity, api) {
  entity.columns.forEach((column) => {
    api.notify("remove", `${entity.id}-filter-${column.id}`)
    api.notify("remove", `${entity.id}-filter-${column.id}Min`)
    api.notify("remove", `${entity.id}-filter-${column.id}Max`)
  })

  api.notify("remove", `${entity.id}-searchbarInput`)

  api.notify("remove", `${entity.id}-firstPageButton`)
  api.notify("remove", `${entity.id}-prevPageButton`)
  api.notify("remove", `${entity.id}-currentPageInput`)
  api.notify("remove", `${entity.id}-nextPageButton`)
  api.notify("remove", `${entity.id}-lastPageButton`)
  api.notify("remove", `${entity.id}-pageSizeSelect`)
}

/**
 * Infers the column type from a value.
 * @param {any} value
 * @returns {string}
 */
function getDefaultColumnType(value) {
  if (typeof value === "number") return "number"
  if (typeof value === "boolean") return "boolean"
  if (value instanceof Date) return "date"
  return "string"
}

/**
 * Gets the default filter configuration for a column type.
 * @param {string} type
 * @returns {object}
 */
function getDefaultColumnFilter(type) {
  if (type === "number") return { type: "range" }
  if (type === "boolean") return { type: "select", options: ["", true, false] }
  if (type === "date") return { type: "date" }
  return { type: "text" }
}

/**
 * Gets the default column width based on filter type.
 * @param {string} filterType
 * @returns {number}
 */
function getDefaultColumnWidth(filterType) {
  if (filterType === "number") return 70
  if (filterType === "range") return 100
  if (filterType === "select") return 70
  if (filterType === "date") return 120
  if (filterType === "time") return 120
  if (filterType === "datetime") return 170
  return 200
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  const [firstChar, ...rest] = str
  return [firstChar.toUpperCase(), ...rest].join("")
}

/**
 * Ensures all rows have unique and stable keys.
 * @param {DataGridEntity} entity
 */
function assertRowKeys(entity) {
  if (!entity.rows.length) return

  const seen = new Set()
  entity.rows.forEach((row, index) => {
    const rowKey = getRowKeyValue(entity, row)
    const isValidType = typeof rowKey === "string" || typeof rowKey === "number"
    if (!isValidType) {
      throw new Error(
        `[table] Invalid row key at row ${index} for field "${entity.rowId}". Keys must be string or number. Set entity.rowId to a stable key field.`,
      )
    }
    if (seen.has(rowKey)) {
      throw new Error(
        `[table] Duplicate row key "${rowKey}" for field "${entity.rowId}". Keys must be unique.`,
      )
    }
    seen.add(rowKey)
  })
}
