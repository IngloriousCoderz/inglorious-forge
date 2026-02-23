/* eslint-disable no-magic-numbers */

/**
 * @typedef {import('../../types/table').TableEntity} TableEntity
 * @typedef {import('../../types/table').TableColumn} TableColumn
 */

import { getRowKeyValue, getRows, getTotalRows } from "./helpers.js"

/**
 * Resets the table entity with default state.
 * @param {TableEntity} entity
 */
export function create(entity) {
  initTable(entity)
}

/**
 * Toggles sorting for a column.
 * @param {TableEntity} entity
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
 * @param {TableEntity} entity
 */
export function sortsClear(entity) {
  entity.sorts = []
}

/**
 * Updates a filter value for a column.
 * @param {TableEntity} entity
 * @param {{ columnId: string, value: any }} payload
 */
export function filterChange(entity, { columnId, value }) {
  if (value == null || value === "") {
    delete entity.filters[columnId]
  } else {
    entity.filters[columnId] = value
  }

  // Reset to first page when filtering
  if (entity.pagination) {
    entity.pagination.page = 0
  }
}

/**
 * Clears all filters.
 * @param {TableEntity} entity
 */
export function filtersClear(entity) {
  entity.filters = {}
  if (entity.pagination) {
    entity.pagination.page = 0
  }
}

/**
 * Updates the search term.
 * @param {TableEntity} entity
 * @param {string} search
 */
export function searchChange(entity, search) {
  entity.search.value = search
}

/**
 * Changes the current page.
 * @param {TableEntity} entity
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
 * @param {TableEntity} entity
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
 * @param {TableEntity} entity
 */
export function pagePrev(entity) {
  if (!entity.pagination) return
  entity.pagination.page = Math.max(entity.pagination.page - 1, 0)
}

/**
 * Changes the page size.
 * @param {TableEntity} entity
 * @param {number} pageSize
 */
export function pageSizeChange(entity, pageSize) {
  if (!entity.pagination) return

  entity.pagination.pageSize = pageSize
  entity.pagination.page = 0
}

/**
 * Selects a row.
 * @param {TableEntity} entity
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
 * @param {TableEntity} entity
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
 * @param {TableEntity} entity
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
 * @param {TableEntity} entity
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
 * @param {TableEntity} entity
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
 * @param {TableEntity} entity
 */
export function selectionClear(entity) {
  entity.selection.length = 0
}

/**
 * Initializes the table state.
 * @param {TableEntity} entity
 */
function initTable(entity) {
  entity.data ??= []
  entity.rowId ??= "id"

  // Auto-generate columns from first data item if not provided
  if (!entity.columns && entity.data.length) {
    const [firstRow] = entity.data

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
  if (type === "boolean")
    return { type: "select", options: [null, true, false] }
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
 * @param {TableEntity} entity
 */
function assertRowKeys(entity) {
  if (!entity.data.length) return

  const seen = new Set()
  entity.data.forEach((row, index) => {
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
