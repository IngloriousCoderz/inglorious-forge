/**
 * @typedef {import('../../../types/data-display/data-grid').Column} Column
 * @typedef {import('../../../types/data-display/data-grid').DataGridProps} DataGridProps
 * @typedef {import('../../../types/data-display/data-grid').Row} Row
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat, when } from "@inglorious/web"

import { button } from "../../controls/button/index.js"
import { input } from "../../controls/input/index.js"
import { select } from "../../controls/select/index.js"
import { filters } from "./filters"
import {
  getPaginationInfo,
  getRowKeyValue,
  getRows,
  getSortDirection,
} from "./helpers.js"

const DIVISOR = 2
const PERCENTAGE_TO_FLEX = 0.01

const PRETTY_PAGE = 1
const FIRST_PAGE = 0
const LAST_PAGE = 1

export const dataGrid = {
  /**
   * Measures and sets initial column widths.
   * This is called after the initial render to capture the "auto" widths of columns.
   * @param {DataGridProps} props The table props.
   * @param {HTMLElement} containerEl The header row element containing the columns.
   */
  mount(props, containerEl) {
    const columns = containerEl.querySelectorAll(":scope > *")
    ;[...columns].forEach((column, index) => {
      props.columns[index].width = column.offsetWidth
    })
  },

  /**
   * Renders the main table component.
   * @param {DataGridProps} props The table props.
   * @returns {TemplateResult} The rendered table.
   */
  render(props) {
    const { striped = false } = props

    const classes = {
      "iw-data-grid": true,
      "iw-data-grid-striped": striped,
    }

    return html`<div class=${classMap(classes)}>
      ${this.renderHeader?.(props)} ${this.renderBody?.(props)}
      ${this.renderFooter?.(props)}
    </div> `
  },

  /**
   * Renders the table header.
   * @param {DataGridProps} props The table props.
   * @returns {TemplateResult} The rendered header.
   */
  renderHeader(props) {
    return html`<div class="iw-data-grid-header">
      <div
        class="iw-data-grid-header-row"
        ${ref((el) => {
          if (
            el &&
            props.columns.some(({ width }) => typeof width === "string")
          ) {
            queueMicrotask(() => {
              props.onMount?.(el)
            })
          }
        })}
      >
        ${repeat(
          props.columns,
          (column) => column.id,
          (column, index) =>
            this.renderHeaderColumn?.(props, { column, index }),
        )}
      </div>

      ${props.search && this.renderSearchbar?.(props)}
    </div>`
  },

  /**
   * Renders a single column in the header.
   * @param {DataGridProps} props The table props.
   * @param {object} payload The payload.
   * @param {Column} payload.column The column definition.
   * @returns {TemplateResult} The rendered header column.
   */
  renderHeaderColumn(props, { column }) {
    return html`<div
      class="iw-data-grid-header-column"
      style=${getColumnStyle(column)}
    >
      <div
        @click=${() => column.isSortable && props.onSortChange?.(column.id)}
        class="iw-data-grid-header-title"
      >
        ${column.title} ${getSortIcon(getSortDirection(props, column.id))}
      </div>

      ${column.isFilterable && filters.render(props, column)}
    </div>`
  },

  /**
   * Renders the search bar.
   * @param {DataGridProps} props The table props.
   * @returns {TemplateResult} The rendered search bar.
   */
  renderSearchbar(props) {
    return html`<div class="iw-data-grid-searchbar">
      ${input.render({
        size: "sm",
        fullWidth: true,
        name: "search",
        inputType: "text",
        placeholder: props.search.placeholder ?? "Fuzzy search...",
        value: props.search.value,
        onChange: (value) => props.onSearchChange?.(value),
      })}
    </div>`
  },

  /**
   * Renders the table body with rows.
   * @param {DataGridProps} props The table props.
   * @returns {TemplateResult} The rendered table body.
   */
  renderBody(props) {
    return html`<div class="iw-data-grid-body">
      ${repeat(
        getRows(props),
        (row) => getRowKeyValue(props, row),
        (row, index) => this.renderRow?.(props, { row, index }),
      )}
    </div>`
  },

  /**
   * Renders a single row in the table body.
   * @param {DataGridProps} props The table props.
   * @param {object} payload The payload.
   * @param {Row} payload.row The row data.
   * @param {number} payload.index The row index.
   * @returns {TemplateResult} The rendered row.
   */
  renderRow(props, { row, index }) {
    const rowId = getRowKeyValue(props, row)

    return html`<div
      @click=${() => props.onRowToggle?.(rowId)}
      class="iw-data-grid-row ${classMap({
        "iw-data-grid-row-even": index % DIVISOR,
        "iw-data-grid-row-selected": props.selection?.includes(rowId),
      })}"
    >
      ${repeat(
        props.columns,
        (column) => column.id,
        (column, index) =>
          this.renderCell?.(props, { cell: row[column.id], index }),
      )}
    </div>`
  },

  /**
   * Renders a single cell within a row.
   * @param {DataGridProps} props The table props.
   * @param {object} payload The payload.
   * @param {any} payload.cell The cell data.
   * @param {number} payload.index The column index.
   * @returns {TemplateResult} The rendered cell.
   */
  renderCell(props, { cell, index }) {
    const column = props.columns[index]

    return html`<div
      class="iw-data-grid-cell ${classMap({
        "iw-data-grid-cell-number": column.type === "number",
        "iw-data-grid-cell-date": column.type === "date",
        "iw-data-grid-cell-boolean": column.type === "boolean",
      })}"
      style=${getColumnStyle(column)}
    >
      ${this.renderValue?.(props, { value: cell, column, index })}
    </div>`
  },

  /**
   * Renders the value within a cell. This can be overridden for custom formatting.
   * @param {DataGridProps} _props The table props (ignored).
   * @param {object} payload The payload.
   * @param {any} payload.value The value to render.
   * @returns {any} The value to be rendered.
   */
  renderValue(_props, { value }) {
    return value
  },

  /**
   * Renders the table footer.
   * @param {DataGridProps} props The table props.
   * @returns {TemplateResult} The rendered footer.
   */
  renderFooter(props) {
    const pagination = getPaginationInfo(props)

    return html`<div class="iw-data-grid-footer">
        <div class="iw-data-grid-footer-row">
          <div>
            ${pagination.start + PRETTY_PAGE} to ${pagination.end} of ${pagination.totalRows}
            entries
          </div>

          ${this.renderPagination?.(props, pagination)}

          ${when(pagination.pageSizes, () => this.renderPageSize?.(props, pagination))}
        </div>
      </div>
    </div>`
  },

  /**
   * Renders the pagination controls.
   * @param {DataGridProps} props The table props.
   * @param {object} pagination The pagination info object from `getPaginationInfo`.
   * @returns {TemplateResult} The rendered pagination controls.
   */
  renderPagination(props, pagination) {
    return html`<div class="iw-data-grid-row">
      ${button.render({
        color: "secondary",
        size: "sm",
        children: html`|&#10094;`,
        disabled: !pagination.hasPrevPage,
        onClick: () => props.onPageChange?.(FIRST_PAGE),
      })}
      ${button.render({
        color: "secondary",
        size: "sm",
        children: html`&#10094;`,
        disabled: !pagination.hasPrevPage,
        onClick: () => props.onPagePrev?.(),
      })}
      ${input.render({
        name: "page",
        size: "sm",
        inputType: "number",
        min: 1,
        max: pagination.totalPages,
        value: pagination.page + PRETTY_PAGE,
        onChange: (value) => props.onPageChange?.(Number(value) - PRETTY_PAGE),
      })}
      /
      <span>${pagination.totalPages}</span>
      ${button.render({
        color: "secondary",
        size: "sm",
        children: html`&#10095;`,
        disabled: !pagination.hasNextPage,
        onClick: () => props.onPageNext?.(),
      })}
      ${button.render({
        color: "secondary",
        size: "sm",
        children: html`&#10095;|`,
        disabled: !pagination.hasNextPage,
        onClick: () => props.onPageChange?.(pagination.totalPages - LAST_PAGE),
      })}
    </div>`
  },

  renderPageSize(props, pagination) {
    return html`<div class="iw-data-grid-footer-row">
      <div>Page size:</div>
      ${select.render({
        size: "sm",
        value: pagination.pageSize,
        options: pagination.pageSizes,
        onChange: (value) => props.onPageSizeChange?.(Number(value)),
      })}
    </div>`
  },
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
