/**
 * @typedef {import('../../../types/data-display/data-grid').Column} Column
 * @typedef {import('../../../types/data-display/data-grid').DataGridProps} DataGridProps
 * @typedef {import('../../../types/data-display/data-grid').Row} Row
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, repeat, when } from "@inglorious/web"

import { input } from "../../controls/input/index.js"
import { select } from "../../controls/select/index.js"
import { pagination } from "../../navigation/pagination/index.js"
import { virtualList } from "../virtual-list/index.js"
import { filters } from "./filters"
import {
  getPaginationInfo,
  getRowKeyValue,
  getRows,
  getSortDirection,
} from "./helpers.js"

const DIVISOR = 2

const PRETTY_PAGE = 1
const FIRST_PAGE = 0
const LAST_PAGE = 1

export const dataGrid = {
  /**
   * Main entrypoint. Allows override to wire to the store.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered data grid.
   */
  render(props) {
    return this.renderDataGrid(props)
  },

  /**
   * Renders the data grid component.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered data grid.
   */
  renderDataGrid(props) {
    const { isStriped = false } = props

    const classes = {
      "iw-data-grid": true,
      "iw-data-grid-striped": isStriped,
    }

    return html`<div class=${classMap(classes)}>
      ${this.renderHeader?.(props)} ${this.renderBody?.(props)}
      ${this.renderFooter?.(props)}
    </div> `
  },

  /**
   * Renders the data grid header.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered header.
   */
  renderHeader(props) {
    return html`<div class="iw-data-grid-header">
      ${props.search && this.renderToolbar?.(props)}
      <div class="iw-data-grid-header-row">
        ${repeat(
          props.columns,
          (column) => column.id,
          (column, index) =>
            this.renderHeaderColumn?.(props, { column, index }),
        )}
      </div>
    </div>`
  },

  /**
   * Renders the toolbar above the header row.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult}
   */
  renderToolbar(props) {
    return html`<div class="iw-data-grid-toolbar">
      ${this.renderSearchbar?.(props)}
    </div>`
  },

  /**
   * Renders a single column in the header.
   * @param {DataGridProps} props The data grid props.
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

      <div
        class="iw-data-grid-column-resizer"
        @pointerdown=${(event) =>
          props.onColumnResizeStart?.({
            columnId: column.id,
            event,
            width: getRenderedColumnWidth(column, event),
          })}
      ></div>
    </div>`
  },

  /**
   * Renders the search bar.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered search bar.
   */
  renderSearchbar(props) {
    return html`<div class="iw-data-grid-searchbar">
      ${input.render({
        size: "sm",
        isFullWidth: true,
        name: "search",
        inputType: "text",
        placeholder: props.search.placeholder ?? "Fuzzy search...",
        value: props.search.value,
        onChange: (value) => props.onSearchChange?.(value),
      })}
    </div>`
  },

  /**
   * Renders the data grid body with rows.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered data grid body.
   */
  renderBody(props) {
    const rows = getRows(props)

    if (!props.isVirtualized) {
      return html`<div class="iw-data-grid-body">
        ${repeat(
          rows,
          (row) => getRowKeyValue(props, row),
          (row, index) => this.renderRow?.(props, { row, index }),
        )}
      </div>`
    }

    const virtualState = getVirtualizationState(props, rows.length)
    const virtualEntity = {
      id: props.id,
      type: "dataGridVirtualRows",
      items: rows,
      className: "iw-data-grid-body",
      scrollTop: virtualState.scrollTop,
      visibleRange: virtualState.visibleRange,
      viewportHeight: virtualState.viewportHeight,
      bufferSize: virtualState.bufferSize,
      itemHeight: virtualState.itemHeight,
      estimatedHeight: virtualState.estimatedHeight,
    }

    const virtualApi = {
      notify: (target, payload) => {
        if (target === `#${props.id}:scroll`) {
          props.onVirtualScroll?.(payload)
        }
        if (target === `#${props.id}:mount`) {
          props.onVirtualMount?.(payload)
        }
      },
      getType: () => ({
        renderItem: (_entity, { item, index }) =>
          this.renderRow?.(props, { row: item, index }),
      }),
    }

    return virtualList.render(virtualEntity, virtualApi)
  },

  /**
   * Renders a single row in the data grid body.
   * @param {DataGridProps} props The data grid props.
   * @param {object} payload The payload.
   * @param {Row} payload.row The row data.
   * @param {number} payload.index The row index.
   * @returns {TemplateResult} The rendered row.
   */
  renderRow(props, { row, index }) {
    const rowId = getRowKeyValue(props, row)

    return html`<div
      @click=${(event) =>
        props.onRowClick?.({
          rowId,
          shiftKey: event.shiftKey,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
        })}
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
   * @param {DataGridProps} props The data grid props.
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
   * @param {DataGridProps} _props The data grid props (ignored).
   * @param {object} payload The payload.
   * @param {any} payload.value The value to render.
   * @returns {any} The value to be rendered.
   */
  renderValue(_props, { value }) {
    return value
  },

  /**
   * Renders the data grid footer.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered footer.
   */
  renderFooter(props) {
    const pagination = getPaginationInfo(props)

    if (!pagination) {
      return null
    }

    return html`<div class="iw-data-grid-footer">
      <div class="iw-data-grid-footer-row">
        <div>
          ${pagination.start + PRETTY_PAGE} to ${pagination.end} of
          ${pagination.totalRows} entries
        </div>

        ${this.renderPagination?.(props, pagination)}
        ${when(pagination.pageSizes, () =>
          this.renderPageSize?.(props, pagination),
        )}
      </div>
    </div>`
  },

  /**
   * Renders the pagination controls.
   * @param {DataGridProps} props The data grid props.
   * @param {object} pagination The pagination info object from `getPaginationInfo`.
   * @returns {TemplateResult} The rendered pagination controls.
   */
  renderPagination(props, paginationInfo) {
    return html`<div class="iw-data-grid-row">
      ${pagination.renderControl(
        {
          buttonSize: "sm",
          buttonVariant: "outline",
          itemClassName: "iw-data-grid-pagination-button",
        },
        {
          label: "«",
          target: FIRST_PAGE + PRETTY_PAGE,
          isDisabled: !paginationInfo.hasPrevPage,
          onChange: () => props.onPageChange?.(FIRST_PAGE),
        },
      )}
      ${pagination.renderControl(
        {
          buttonSize: "sm",
          buttonVariant: "outline",
          itemClassName: "iw-data-grid-pagination-button",
        },
        {
          label: "‹",
          target: Math.max(PRETTY_PAGE, paginationInfo.page),
          isDisabled: !paginationInfo.hasPrevPage,
          onChange: () => props.onPagePrev?.(),
        },
      )}
      ${input.render({
        name: "page",
        size: "sm",
        inputType: "number",
        min: 1,
        max: paginationInfo.totalPages,
        value: paginationInfo.page + PRETTY_PAGE,
        onChange: (value) => props.onPageChange?.(Number(value) - PRETTY_PAGE),
      })}
      /
      <span>${paginationInfo.totalPages}</span>
      ${pagination.renderControl(
        {
          buttonSize: "sm",
          buttonVariant: "outline",
          itemClassName: "iw-data-grid-pagination-button",
        },
        {
          label: "›",
          target: Math.min(paginationInfo.totalPages, paginationInfo.page + 2),
          isDisabled: !paginationInfo.hasNextPage,
          onChange: () => props.onPageNext?.(),
        },
      )}
      ${pagination.renderControl(
        {
          buttonSize: "sm",
          buttonVariant: "outline",
          itemClassName: "iw-data-grid-pagination-button",
        },
        {
          label: "»",
          target: paginationInfo.totalPages,
          isDisabled: !paginationInfo.hasNextPage,
          onChange: () =>
            props.onPageChange?.(paginationInfo.totalPages - LAST_PAGE),
        },
      )}
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
  if (column.width == null || column.width === "auto") {
    return "flex: 1 1 0; min-width: 0"
  }

  if (typeof column.width === "string") {
    if (column.width.endsWith("fr")) {
      const fraction = Number(column.width.slice(0, -2))
      const normalizedFraction =
        Number.isFinite(fraction) && fraction > 0 ? fraction : 1

      return `flex: ${normalizedFraction} 1 0; min-width: 0`
    }

    if (column.width.endsWith("%")) {
      const percentage = Number(column.width.slice(0, -1))
      if (Number.isFinite(percentage) && percentage >= 100) {
        return "flex: 1 1 0; min-width: 0"
      }

      return `flex: 0 0 ${column.width}; width: ${column.width}`
    }

    return `flex: 0 0 ${column.width}; width: ${column.width}`
  }

  return `flex: 0 0 ${column.width}px; width: ${column.width}px`
}

/**
 * Gets the current rendered width of a header column.
 * @param {Column} column
 * @param {PointerEvent} event
 * @returns {number}
 */
function getRenderedColumnWidth(column, event) {
  if (typeof column.width === "number") {
    return column.width
  }

  return event.currentTarget?.parentElement?.offsetWidth ?? 0
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

function getVirtualizationState(props, totalItems) {
  const fallback = {
    scrollTop: 0,
    visibleRange: { start: 0, end: Math.min(20, totalItems) },
    viewportHeight: 600,
    bufferSize: 5,
    itemHeight: null,
    estimatedHeight: 50,
  }

  const virtualState = props.virtualization ?? fallback
  const visibleRange = virtualState.visibleRange ?? fallback.visibleRange
  const start = Math.max(0, Math.min(visibleRange.start ?? 0, totalItems))
  const end = Math.max(
    start,
    Math.min(visibleRange.end ?? totalItems, totalItems),
  )

  return {
    ...fallback,
    ...virtualState,
    visibleRange: { start, end },
  }
}
