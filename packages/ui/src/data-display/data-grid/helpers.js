/**
 * Gets the row key value based on table rowId.
 * @param {TableEntity} entity
 * @param {any} row
 * @returns {string|number}
 */
export function getRowKeyValue(entity, row) {
  return row?.[entity.rowId]
}

/**
 * Gets the processed rows (filtered, searched, sorted, paginated).
 * @param {TableEntity} entity
 * @returns {any[]}
 */
export function getRows(entity) {
  let rows = entity.rows
  rows = applyFilters(entity, rows)
  rows = applySearch(entity, rows)
  rows = applySorts(entity, rows)
  rows = applyPagination(entity, rows)

  return rows
}

/**
 * Gets the total number of rows after filtering and searching.
 * @param {TableEntity} entity
 * @returns {number}
 */
export function getTotalRows(entity) {
  let rows = entity.rows
  rows = applyFilters(entity, rows)
  rows = applySearch(entity, rows)
  return rows.length
}

/**
 * Gets pagination information.
 * @param {TableEntity} entity
 * @returns {object|null}
 */
export function getPaginationInfo(entity) {
  if (!entity.pagination) return null

  const totalRows = getTotalRows(entity)
  const { page, pageSize } = entity.pagination
  const totalPages = Math.ceil(totalRows / pageSize)
  const start = page * pageSize
  const end = Math.min((page + 1) * pageSize, totalRows)

  return {
    page,
    pageSize,
    totalPages,
    totalRows,
    start,
    end,
    hasNextPage: page < totalPages - 1,
    hasPrevPage: page > 0,
  }
}

/**
 * Gets the sort direction for a column.
 * @param {TableEntity} entity
 * @param {string} columnId
 * @returns {"asc"|"desc"|null}
 */
export function getSortDirection(entity, columnId) {
  const sort = entity.sorts.find((s) => s.column === columnId)
  return sort?.direction || null
}

/**
 * Gets the sort index (priority) for a column.
 * @param {TableEntity} entity
 * @param {string} columnId
 * @returns {number}
 */
export function getSortIndex(entity, columnId) {
  return entity.sorts.findIndex((s) => s.column === columnId)
}

/**
 * Gets the filter value for a column.
 * @param {TableEntity} entity
 * @param {string} columnId
 * @returns {any}
 */
export function getFilter(entity, columnId) {
  return entity.filters[columnId]
}

/**
 * Checks if a row is selected.
 * @param {TableEntity} entity
 * @param {string|number} rowId
 * @returns {boolean}
 */
export function isRowSelected(entity, rowId) {
  return entity.selection.includes(rowId)
}

/**
 * Checks if all visible rows are selected.
 * @param {TableEntity} entity
 * @returns {boolean}
 */
export function isAllSelected(entity) {
  const rows = getRows(entity)
  return (
    rows.length &&
    rows.every((row) => entity.selection.includes(getRowKeyValue(entity, row)))
  )
}

/**
 * Checks if some (but not all) visible rows are selected.
 * @param {TableEntity} entity
 * @returns {boolean}
 */
export function isSomeSelected(entity) {
  const rows = getRows(entity)
  const selectedCount = rows.filter((row) =>
    entity.selection.includes(getRowKeyValue(entity, row)),
  ).length
  return selectedCount && selectedCount < rows.length
}

/**
 * Applies filters to the data.
 * @param {TableEntity} entity
 * @param {any[]} rows
 * @returns {any[]}
 */
function applyFilters(entity, rows) {
  if (!Object.keys(entity.filters).length) {
    return rows
  }

  return rows.filter((row) => {
    return Object.entries(entity.filters).every(([columnId, filterValue]) => {
      const column = entity.columns.find((c) => c.id === columnId)
      if (!column) return true

      // Custom filter function
      if (column.filterFn) {
        return column.filterFn(row, filterValue)
      }

      // Default filters by type
      const value = row[columnId]

      if (["range", "date", "time", "datetime"].includes(column.filter.type)) {
        const { min, max } = filterValue
        if (min != null && value < min) return false
        if (max != null && value > max) return false
        return true
      }

      if (["number", "boolean", "select"].includes(column.filter.type)) {
        return value === filterValue
      }

      // String filtering (case-insensitive contains)
      return String(value)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase())
    })
  })
}

/**
 * Applies search to the data.
 * @param {TableEntity} entity
 * @param {any[]} rows
 * @returns {any[]}
 */
function applySearch(entity, rows) {
  if (!entity.search?.value) {
    return rows
  }

  const searchLower = entity.search.value.toLowerCase()

  return rows.filter((row) =>
    entity.columns.some((column) => {
      const value = row[column.id]
      const formattedValue = column.format?.(value) ?? String(value)
      return formattedValue.toLowerCase().includes(searchLower)
    }),
  )
}

/**
 * Applies sorting to the data.
 * @param {TableEntity} entity
 * @param {any[]} rows
 * @returns {any[]}
 */
function applySorts(entity, rows) {
  if (!entity.sorts.length) {
    return rows
  }

  return [...rows].sort((a, b) => {
    for (const { column: columnId, direction } of entity.sorts) {
      const column = entity.columns.find((c) => c.id === columnId)
      let aVal = a[columnId]
      let bVal = b[columnId]

      // Custom sort function
      if (column?.sortFn) {
        const result =
          direction === "asc" ? column.sortFn(a, b) : column.sortFn(b, a)
        if (result !== 0) return result
        continue
      }

      // Default sorting
      if (aVal === bVal) continue
      if (aVal == null) return 1
      if (bVal == null) return -1

      const comparison = aVal < bVal ? -1 : 1
      return direction === "asc" ? comparison : -comparison
    }
    return 0
  })
}

/**
 * Applies pagination to the data.
 * @param {TableEntity} entity
 * @param {any[]} rows
 * @returns {any[]}
 */
function applyPagination(entity, rows) {
  if (!entity.pagination) {
    return rows
  }

  const { page, pageSize } = entity.pagination
  const start = page * pageSize
  return rows.slice(start, start + pageSize)
}
