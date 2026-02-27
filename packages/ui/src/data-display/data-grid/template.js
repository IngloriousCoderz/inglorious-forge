/**
 * @typedef {import('../../../types/data-display/data-grid').Column} Column
 * @typedef {import('../../../types/data-display/data-grid').DataGridEntity} DataGridEntity
 * @typedef {import('../../../types/data-display/data-grid').Row} Row
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat } from "@inglorious/web"

import { filters } from "./filters"
import {
  getPaginationInfo,
  getRowKeyValue,
  getRows,
  getSortDirection,
} from "./helpers.js"

const DIVISOR = 2
const PRETTY_PAGE = 1
const PERCENTAGE_TO_FLEX = 0.01

/**
 * Measures and sets initial column widths.
 * This is called after the initial render to capture the "auto" widths of columns.
 * @param {DataGridEntity} entity The table entity.
 * @param {HTMLElement} containerEl The header row element containing the columns.
 */
export function mount(entity, containerEl) {
  const columns = containerEl.querySelectorAll(":scope > *")
  ;[...columns].forEach((column, index) => {
    entity.columns[index].width = column.offsetWidth
  })
}

/**
 * Renders the main table component.
 * @param {DataGridEntity} entity The table entity.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered table.
 */
export function render(entity, api) {
  const { striped = false } = entity

  const type = api.getType(entity.type)

  const classes = {
    "iw-data-grid": true,
    "iw-data-grid-striped": striped,
  }

  return html`<div class=${classMap(classes)}>
    ${type.renderHeader(entity, api)} ${type.renderBody(entity, api)}
    ${type.renderFooter(entity, api)}
  </div> `
}

/**
 * Renders the table header.
 * @param {DataGridEntity} entity The table entity.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered header.
 */
export function renderHeader(entity, api) {
  const type = api.getType(entity.type)

  return html`<div class="iw-data-grid-header">
    <div
      class="iw-data-grid-header-row"
      ${ref((el) => {
        if (
          el &&
          entity.columns.some(({ width }) => typeof width === "string")
        ) {
          queueMicrotask(() => {
            api.notify(`#${entity.id}:mount`, el)
          })
        }
      })}
    >
      ${repeat(
        entity.columns,
        (column) => column.id,
        (column, index) =>
          type.renderHeaderColumn(entity, { column, index }, api),
      )}
    </div>

    ${entity.search && type.renderSearchbar(entity, api)}
  </div>`
}

/**
 * Renders a single column in the header.
 * @param {DataGridEntity} entity The table entity.
 * @param {object} payload The payload.
 * @param {Column} payload.column The column definition.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered header column.
 */
export function renderHeaderColumn(entity, { column }, api) {
  return html`<div
    class="iw-data-grid-header-column"
    style=${getColumnStyle(column)}
  >
    <div
      @click=${() =>
        column.isSortable && api.notify(`#${entity.id}:sortChange`, column.id)}
      class="iw-data-grid-header-title"
    >
      ${column.title} ${getSortIcon(getSortDirection(entity, column.id))}
    </div>

    ${column.isFilterable && filters.render(entity, column, api)}
  </div>`
}

/**
 * Renders the search bar.
 * @param {DataGridEntity} entity The table entity.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered search bar.
 */
export function renderSearchbar(entity, api) {
  return html`<div class="iw-data-grid-searchbar">
    ${api.render(`${entity.id}-searchbarInput`)}
  </div>`
}

/**
 * Renders the table body with rows.
 * @param {DataGridEntity} entity The table entity.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered table body.
 */
export function renderBody(entity, api) {
  const type = api.getType(entity.type)

  return html`<div class="iw-data-grid-body">
    ${repeat(
      getRows(entity),
      (row) => getRowKeyValue(entity, row),
      (row, index) => type.renderRow(entity, { row, index }, api),
    )}
  </div>`
}

/**
 * Renders a single row in the table body.
 * @param {DataGridEntity} entity The table entity.
 * @param {object} payload The payload.
 * @param {Row} payload.row The row data.
 * @param {number} payload.index The row index.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered row.
 */
export function renderRow(entity, { row, index }, api) {
  const type = api.getType(entity.type)
  const rowId = getRowKeyValue(entity, row)

  return html`<div
    @click=${() => api.notify(`#${entity.id}:rowToggle`, rowId)}
    class="iw-data-grid-row ${classMap({
      "iw-data-grid-row-even": index % DIVISOR,
      "iw-data-grid-row-selected": entity.selection?.includes(rowId),
    })}"
  >
    ${repeat(
      entity.columns,
      (column) => column.id,
      (column, index) =>
        type.renderCell(entity, { cell: row[column.id], index }, api),
    )}
  </div>`
}

/**
 * Renders a single cell within a row.
 * @param {DataGridEntity} entity The table entity.
 * @param {object} payload The payload.
 * @param {any} payload.cell The cell data.
 * @param {number} payload.index The column index.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered cell.
 */
export function renderCell(entity, { cell, index }, api) {
  const type = api.getType(entity.type)
  const column = entity.columns[index]

  return html`<div
    class="iw-data-grid-cell ${classMap({
      "iw-data-grid-cell-number": column.type === "number",
      "iw-data-grid-cell-date": column.type === "date",
      "iw-data-grid-cell-boolean": column.type === "boolean",
    })}"
    style=${getColumnStyle(column)}
  >
    ${type.renderValue(entity, { value: cell, column, index }, api)}
  </div>`
}

/**
 * Renders the value within a cell. This can be overridden for custom formatting.
 * @param {DataGridEntity} _entity The table entity (ignored).
 * @param {object} payload The payload.
 * @param {any} payload.value The value to render.
 * @returns {any} The value to be rendered.
 */
export function renderValue(_entity, { value }) {
  return value
}

/**
 * Renders the table footer.
 * @param {DataGridEntity} entity The table entity.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered footer.
 */
export function renderFooter(entity, api) {
  const type = api.getType(entity.type)
  const pagination = getPaginationInfo(entity)

  return html`<div class="iw-data-grid-footer">
        <div class="iw-data-grid-footer-row">
          <div>
            ${pagination.start + PRETTY_PAGE} to ${pagination.end} of ${pagination.totalRows}
            entries
          </div>

          ${type.renderPagination(entity, pagination, api)}

          ${type.renderPageSize(entity, pagination, api)}
        </div>
      </div>
    </div>`
}

/**
 * Renders the pagination controls.
 * @param {DataGridEntity} entity The table entity.
 * @param {object} pagination The pagination info object from `getPaginationInfo`.
 * @param {Api} api The API object.
 * @returns {TemplateResult} The rendered pagination controls.
 */
export function renderPagination(entity, pagination, api) {
  return html`<div class="iw-data-grid-row">
    ${api.render(`${entity.id}-firstPageButton`)}
    ${api.render(`${entity.id}-prevPageButton`)}
    ${api.render(`${entity.id}-currentPageInput`)} /
    <span>${pagination.totalPages}</span>
    ${api.render(`${entity.id}-nextPageButton`)}
    ${api.render(`${entity.id}-lastPageButton`)}
  </div>`
}

export function renderPageSize(entity, pagination, api) {
  return html`<div class="iw-data-grid-footer-row">
    <div>Page size:</div>
    ${api.render(`${entity.id}-pageSizeSelect`)}
  </div>`
}

/**
 * Generates the style string for a column.
 * @param {Column} column The column definition.
 * @returns {string} The style string.
 */
function getColumnStyle(column) {
  if (typeof column.width === "string") {
    if (column.width?.endsWith("%")) {
      const percentage = Number(column.width.slice(0, -1))
      return `flex: ${percentage * PERCENTAGE_TO_FLEX}`
    }

    return `width: ${column.width}`
  }

  return `width: ${column.width}px`
}

/**
 * Gets the appropriate sort icon for a given direction.
 * @param {"asc"|"desc"|null} direction The sort direction.
 * @returns {string} The sort icon.
 */
function getSortIcon(direction) {
  switch (direction) {
    case "asc":
      return "▲"
    case "desc":
      return "▼"
    default:
      return "▲▼"
  }
}
