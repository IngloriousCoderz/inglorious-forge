/**
 * @typedef {import('../../types/api').API} API
 * @typedef {import('../../types/table.js').TableColumn} TableColumn
 * @typedef {import('../../types/table.js').TableEntity} TableEntity
 * @typedef {import('../../types/table.js').TableRow} TableRow
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */

import { html } from "lit-html"
import { classMap } from "lit-html/directives/class-map.js"
import { ref } from "lit-html/directives/ref.js"
import { repeat } from "lit-html/directives/repeat.js"

import { filters } from "./filters.js"
import {
  getPaginationInfo,
  getRowKeyValue,
  getRows,
  getSortDirection,
} from "./helpers.js"

const DIVISOR = 2
const FIRST_PAGE = 0
const LAST_PAGE = 1
const PRETTY_PAGE = 1
const PERCENTAGE_TO_FLEX = 0.01

/**
 * Measures and sets initial column widths.
 * This is called after the initial render to capture the "auto" widths of columns.
 * @param {TableEntity} entity The table entity.
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
 * @param {TableEntity} entity The table entity.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered table.
 */
export function render(entity, api) {
  const type = api.getType(entity.type)

  return html`<div class="iw-table">
    ${type.renderHeader(entity, api)} ${type.renderBody(entity, api)}
    ${type.renderFooter(entity, api)}
  </div> `
}

/**
 * Renders the table header.
 * @param {TableEntity} entity The table entity.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered header.
 */
export function renderHeader(entity, api) {
  const type = api.getType(entity.type)

  return html`<div class="iw-table-header">
    <div
      class="iw-table-header-row"
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
 * @param {TableEntity} entity The table entity.
 * @param {object} payload The payload.
 * @param {TableColumn} payload.column The column definition.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered header column.
 */
export function renderHeaderColumn(entity, { column }, api) {
  return html`<div
    class="iw-table-header-column"
    style=${getColumnStyle(column)}
  >
    <div
      @click=${() =>
        column.isSortable && api.notify(`#${entity.id}:sortChange`, column.id)}
      class="iw-table-header-title"
    >
      ${column.title} ${getSortIcon(getSortDirection(entity, column.id))}
    </div>

    ${column.isFilterable && filters.render(entity, column, api)}
  </div>`
}

/**
 * Renders the search bar.
 * @param {TableEntity} entity The table entity.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered search bar.
 */
export function renderSearchbar(entity, api) {
  return html`<input
    name="search"
    type="text"
    placeholder=${entity.search.placeholder ?? "Fuzzy search..."}
    value=${entity.search.value}
    @input=${(event) =>
      api.notify(`#${entity.id}:searchChange`, event.target.value)}
    class="iw-table-searchbar"
  />`
}

/**
 * Renders the table body with rows.
 * @param {TableEntity} entity The table entity.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered table body.
 */
export function renderBody(entity, api) {
  const type = api.getType(entity.type)

  return html`<div class="iw-table-body">
    ${repeat(
      getRows(entity),
      (row) => getRowKeyValue(entity, row),
      (row, index) => type.renderRow(entity, { row, index }, api),
    )}
  </div>`
}

/**
 * Renders a single row in the table body.
 * @param {TableEntity} entity The table entity.
 * @param {object} payload The payload.
 * @param {TableRow} payload.row The row data.
 * @param {number} payload.index The row index.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered row.
 */
export function renderRow(entity, { row, index }, api) {
  const type = api.getType(entity.type)
  const rowId = getRowKeyValue(entity, row)

  return html`<div
    @click=${() => api.notify(`#${entity.id}:rowToggle`, rowId)}
    class="iw-table-row ${classMap({
      "iw-table-row-even": index % DIVISOR,
      "iw-table-row-selected": entity.selection?.includes(rowId),
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
 * @param {TableEntity} entity The table entity.
 * @param {object} payload The payload.
 * @param {any} payload.cell The cell data.
 * @param {number} payload.index The column index.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered cell.
 */
export function renderCell(entity, { cell, index }, api) {
  const type = api.getType(entity.type)
  const column = entity.columns[index]

  return html`<div
    class="iw-table-cell ${classMap({
      "iw-table-cell-number": column.type === "number",
      "iw-table-cell-date": column.type === "date",
      "iw-table-cell-boolean": column.type === "boolean",
    })}"
    style=${getColumnStyle(column)}
  >
    ${type.renderValue(entity, { value: cell, column, index }, api)}
  </div>`
}

/**
 * Renders the value within a cell. This can be overridden for custom formatting.
 * @param {TableEntity} _entity The table entity (ignored).
 * @param {object} payload The payload.
 * @param {any} payload.value The value to render.
 * @returns {any} The value to be rendered.
 */
export function renderValue(_entity, { value }) {
  return value
}

/**
 * Renders the table footer.
 * @param {TableEntity} entity The table entity.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered footer.
 */
export function renderFooter(entity, api) {
  const type = api.getType(entity.type)
  const pagination = getPaginationInfo(entity)

  return html`<div class="iw-table-footer">
        <div class="iw-table-footer-row">
          <div>
            ${pagination.start + PRETTY_PAGE} to ${pagination.end} of ${pagination.totalRows}
            entries
          </div>

          ${type.renderPagination(entity, pagination, api)}

          <div class="iw-table-footer-row">
            <div>Page size:</div>
            <select
              name="pageSize"
              @change=${(event) =>
                api.notify(
                  `#${entity.id}:pageSizeChange`,
                  Number(event.target.value),
                )}
            >
              <option>10</option>
              <option>20</option>
              <option>30</option>
            </select>
          </div>
        </div>
      </div>
    </div>`
}

/**
 * Renders the pagination controls.
 * @param {TableEntity} entity The table entity.
 * @param {object} pagination The pagination info object from `getPaginationInfo`.
 * @param {API} api The API object.
 * @returns {TemplateResult} The rendered pagination controls.
 */
export function renderPagination(entity, pagination, api) {
  return html`<div class="iw-table-row">
    <button
      ?disabled=${!pagination.hasPrevPage}
      @click=${() => api.notify(`#${entity.id}:pageChange`, FIRST_PAGE)}
      class="iw-table-pagination-button"
    >
      |&#10094;
    </button>
    <button
      ?disabled=${!pagination.hasPrevPage}
      @click=${() => api.notify(`#${entity.id}:pagePrev`)}
      class="iw-table-pagination-button"
    >
      &#10094;
    </button>
    <input
      name="page"
      type="number"
      min="1"
      max=${pagination.totalPages}
      value=${pagination.page + PRETTY_PAGE}
      class="iw-table-page-input"
      @input=${(event) =>
        api.notify(
          `#${entity.id}:pageChange`,
          Number(event.target.value) - PRETTY_PAGE,
        )}
    />
    /
    <span>${pagination.totalPages}</span>
    <button
      ?disabled="${!pagination.hasNextPage}"
      @click=${() => api.notify(`#${entity.id}:pageNext`)}
      class="iw-table-pagination-button"
    >
      &#10095;
    </button>
    <button
      ?disabled=${!pagination.hasNextPage}
      @click=${() =>
        api.notify(
          `#${entity.id}:pageChange`,
          pagination.totalPages - LAST_PAGE,
        )}
      class="iw-table-pagination-button"
    >
      &#10095;|
    </button>
  </div>`
}

/**
 * Generates the style string for a column.
 * @param {TableColumn} column The column definition.
 * @returns {string} The style string.
 */
function getColumnStyle(column) {
  if (typeof column.width === "string") {
    if (column.width?.endsWith("%")) {
      // eslint-disable-next-line no-magic-numbers
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
