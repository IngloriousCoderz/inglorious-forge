/**
 * @typedef {import('../../../types/data-display/data-grid').Column} Column
 * @typedef {import('../../../types/data-display/data-grid').DataGridProps} DataGridProps
 * @typedef {import('../../../types/data-display/data-grid').Row} Row
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { repeat } from "@inglorious/web/directives/repeat"
import { when } from "@inglorious/web/directives/when"

import { Button } from "../../controls/button/index.js"
import { Checkbox } from "../../controls/checkbox/index.js"
import { Input } from "../../controls/input/index.js"
import { Select } from "../../controls/select/index.js"
import { Pagination } from "../../navigation/pagination/index.js"
import { VirtualList } from "../virtual-list/index.js"
import { Filters } from "./filters/index.js"
import {
  getCellValue,
  getEditCount,
  getPaginationInfo,
  getRowKeyValue,
  getRows,
  getSortDirection,
  isCellEdited,
} from "./helpers.js"

const DIVISOR = 2

const PRETTY_PAGE = 1
const FIRST_PAGE = 0
const LAST_PAGE = 1
const ONE_EDIT = 1
const WEB_URL = /^https?:\/\//i
/** Fields edit dates as `YYYY-MM-DD`. */
const DATE_LENGTH = 10
const DATE_PART_LENGTH = 2
/** Date's months count from zero, people's from one. */
const MONTH_OFFSET = 1
const INPUT_TYPES = { number: "number", date: "date", url: "url" }
const FIRST_ROW = 0
const LAST_ROW = -1
const ROW_STEPS = { ArrowDown: 1, ArrowUp: -1 }
const ARIA_SORT = { asc: "ascending", desc: "descending" }

export const template = {
  /**
   * Main entrypoint for the data grid template. It delegates to the base grid renderer so overrides can still reuse it.
   * Data grids support sorting, filtering, selection, pagination, and optional virtualization.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered data grid.
   */
  render(props) {
    return this.renderDataGrid(props)
  },

  /**
   * Renders the data grid container and wires the header, body, and footer regions.
   * This is the canonical renderer that custom `render()` overrides should call.
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
      ${when(props.search, () => this.renderToolbar?.(props))}
      <div
        class="iw-data-grid-table"
        role="grid"
        aria-label=${props.ariaLabel ?? nothing}
        aria-multiselectable=${props.isMultiSelect ? "true" : nothing}
      >
        ${this.renderHeader?.(props)} ${this.renderBody?.(props)}
      </div>
      ${this.renderFooter?.(props)}
    </div> `
  },

  /**
   * Renders the grid header region with the column headers.
   * Column rendering is delegated to `renderHeaderColumn`.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered header.
   */
  renderHeader(props) {
    return html`<div class="iw-data-grid-header">
      <div class="iw-data-grid-header-row" role="row">
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
   * Renders the toolbar row that contains search, bulk actions, and filtering controls.
   * Override to customize the global header tools.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult}
   */
  renderToolbar(props) {
    return html`<div class="iw-data-grid-toolbar">
      ${this.renderSearchbar?.(props)}
    </div>`
  },

  /**
   * Renders a single column header cell, including sorting and filter affordances.
   * Override to customize header labels or controls per column.
   * @param {DataGridProps} props The data grid props.
   * @param {object} payload The payload.
   * @param {Column} payload.column The column definition.
   * @returns {TemplateResult} The rendered header column.
   */
  renderHeaderColumn(props, { column }) {
    const direction = getSortDirection(props, column.id)

    return html`<div
      class="iw-data-grid-header-column"
      role="columnheader"
      aria-sort=${column.isSortable ? (ARIA_SORT[direction] ?? "none") : nothing}
      style=${getColumnStyle(column)}
    >
      ${when(
        column.isSortable,
        () =>
          html`<button
            type="button"
            class="iw-data-grid-header-title iw-data-grid-header-sort"
            @click=${() => props.onSortChange?.(column.id)}
          >
            ${column.title}
            <span aria-hidden="true">${getSortIcon(direction)}</span>
          </button>`,
        () =>
          html`<div class="iw-data-grid-header-title">${column.title}</div>`,
      )}
      ${when(column.isFilterable, () => Filters.render(props, column))}

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
   * Renders the global search input shown in the grid toolbar.
   * Used when `search` is enabled in the grid props.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered search bar.
   */
  renderSearchbar(props) {
    return html`<div class="iw-data-grid-searchbar">
      ${Input.render({
        size: "sm",
        isFullWidth: true,
        name: "search",
        ariaLabel: props.search.ariaLabel ?? "Search",
        inputType: "text",
        placeholder: props.search.placeholder ?? "Fuzzy search...",
        value: props.search.value,
        onChange: (value) => props.onSearchChange?.(value),
      })}
    </div>`
  },

  /**
   * Renders the grid body, either as a standard list of rows or as a virtualized list.
   * Row rendering is delegated to `renderRow`.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered data grid body.
   */
  renderBody(props) {
    const rows = getRows(props)
    const rowIds = rows.map((row) => getRowKeyValue(props, row))
    const tabStopId = rowIds.includes(props.selectionAnchor)
      ? props.selectionAnchor
      : rowIds[FIRST_ROW]
    const renderRow = (row, index) =>
      this.renderRow?.(props, {
        row,
        index,
        isTabStop: getRowKeyValue(props, row) === tabStopId,
      })

    if (!props.isVirtualized) {
      return html`<div class="iw-data-grid-body">
        ${repeat(rows, (row) => getRowKeyValue(props, row), renderRow)}
      </div>`
    }

    const virtualState = getVirtualizationState(props, rows.length)
    const virtualEntity = {
      id: props.id,
      type: "DataGridVirtualRows",
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
        renderItem: (_entity, { item, index }) => renderRow(item, index),
      }),
    }

    return VirtualList.render(virtualEntity, virtualApi)
  },

  /**
   * Renders a single data row and wires row click/selection handlers.
   * The row is focusable: arrows, Home and End move between rows, Space
   * toggles the row as Ctrl+click does, Enter selects it alone, and Shift
   * with either extends the selection. Only the tab stop row is in the tab
   * order. Cells are delegated to `renderCell` for customization.
   * @param {DataGridProps} props The data grid props.
   * @param {object} payload The payload.
   * @param {Row} payload.row The row data.
   * @param {number} payload.index The row index.
   * @param {boolean} [payload.isTabStop] Whether Tab reaches this row.
   * @returns {TemplateResult} The rendered row.
   */
  renderRow(props, { row, index, isTabStop = false }) {
    const rowId = getRowKeyValue(props, row)
    const isSelected = Boolean(props.selection?.includes(rowId))

    return html`<div
      role="row"
      aria-selected=${String(isSelected)}
      tabindex=${isTabStop ? "0" : "-1"}
      @click=${(event) =>
        props.onRowClick?.({
          rowId,
          shiftKey: event.shiftKey,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
        })}
      @keydown=${(event) => handleRowKeydown(event, props, rowId)}
      class="iw-data-grid-row ${classMap({
        "iw-data-grid-row-even": index % DIVISOR,
        "iw-data-grid-row-selected": isSelected,
      })}"
    >
      ${repeat(
        props.columns,
        (column) => column.id,
        (column, index) =>
          this.renderCell?.(props, {
            cell: getCellValue(props, row, column.id),
            index,
            row,
          }),
      )}
    </div>`
  },

  /**
   * Renders a single cell container and delegates the value to `renderValue`.
   * Override to customize per-column cell structure.
   * @param {DataGridProps} props The data grid props.
   * @param {object} payload The payload.
   * @param {any} payload.cell The cell data, with any unsaved edit.
   * @param {number} payload.index The column index.
   * @param {Row} payload.row The row the cell is in.
   * @returns {TemplateResult} The rendered cell.
   */
  renderCell(props, { cell, index, row }) {
    const column = props.columns[index]
    const isEditable = Boolean(column.isEditable && row)

    return html`<div
      role="gridcell"
      class="iw-data-grid-cell ${classMap({
        "iw-data-grid-cell-number": column.type === "number",
        "iw-data-grid-cell-date": column.type === "date",
        "iw-data-grid-cell-boolean": column.type === "boolean",
        "iw-data-grid-cell-editable": isEditable,
        "iw-data-grid-cell-edited":
          isEditable && isCellEdited(props, row, column.id),
      })}"
      style=${getColumnStyle(column)}
      @click=${isEditable ? (event) => event.stopPropagation() : undefined}
    >
      ${when(
        isEditable,
        () => this.renderEditor?.(props, { value: cell, column, row, index }),
        () => this.renderValue?.(props, { value: cell, column, index }),
      )}
    </div>`
  },

  /**
   * Renders the field that edits a cell of an `isEditable` column: a
   * drop-down when the column has `options`, a checkbox for booleans, a date
   * or number field for those types, and a text field otherwise.
   * Override to edit some columns differently.
   * @param {DataGridProps} props The data grid props.
   * @param {object} payload The payload.
   * @param {any} payload.value The cell's value, with any unsaved edit.
   * @param {Column} payload.column The column definition.
   * @param {Row} payload.row The row the cell is in.
   * @returns {TemplateResult} The rendered editor.
   */
  renderEditor(props, { value, column, row }) {
    const change = (next) =>
      props.onCellChange?.({
        rowId: getRowKeyValue(props, row),
        columnId: column.id,
        value: next,
      })

    if (column.options) {
      return Select.render({
        size: "sm",
        ariaLabel: column.title,
        value: value ?? "",
        options: column.options,
        isFullWidth: true,
        onChange: change,
      })
    }

    if (column.type === "boolean") {
      return Checkbox.render({
        "aria-label": column.title,
        isChecked: Boolean(value),
        onChange: change,
      })
    }

    const saved = row[column.id]
    return Input.render({
      size: "sm",
      ariaLabel: column.title,
      inputType: INPUT_TYPES[column.type] ?? "text",
      value: column.type === "date" ? toDateField(value) : (value ?? ""),
      isFullWidth: true,
      onChange: (text) => change(fromField(text, column.type, saved)),
    })
  },

  /**
   * Renders the raw cell value for a column.
   * Override to format values or inject custom content.
   * @param {DataGridProps} _props The data grid props (ignored).
   * @param {object} payload The payload.
   * @param {any} payload.value The value to render.
   * @returns {any} The value to be rendered.
   */
  renderValue(_props, { value, column }) {
    // A link only for a web address: a `javascript:` one must not run.
    return when(
      column.type === "url" && WEB_URL.test(String(value ?? "")),
      () =>
        html`<a href=${value} target="_blank" rel="noopener noreferrer"
          >${value}</a
        >`,
      () => value,
    )
  },

  /**
   * Renders the grid footer, including pagination controls and page size selectors.
   * Footer elements are delegated to `renderPagination` and `renderPageSize`.
   * @param {DataGridProps} props The data grid props.
   * @returns {TemplateResult} The rendered footer.
   */
  renderFooter(props) {
    const pagination = getPaginationInfo(props)
    const editCount = getEditCount(props)

    if (!pagination && !editCount) {
      return null
    }

    return html`<div class="iw-data-grid-footer">
      ${when(editCount, () => this.renderEdits?.(props, editCount))}
      ${when(
        pagination,
        () =>
          html`<div class="iw-data-grid-footer-row">
            <div>
              ${(props.formatRange ?? formatRange)({
                start: pagination.start + PRETTY_PAGE,
                end: pagination.end,
                total: pagination.totalRows,
              })}
            </div>

            ${this.renderPagination?.(props, pagination)}
            ${when(pagination.pageSizes, () =>
              this.renderPageSize?.(props, pagination),
            )}
          </div>`,
      )}
    </div>`
  },

  /**
   * Renders the bar that counts the unsaved edits, with buttons to reset or
   * save them. Shown only while there are edits.
   * @param {DataGridProps} props The data grid props.
   * @param {number} editCount How many cells have unsaved edits.
   * @returns {TemplateResult} The rendered bar.
   */
  renderEdits(props, editCount) {
    return html`<div class="iw-data-grid-footer-row iw-data-grid-edits">
      <div role="status">
        ${(props.formatEditCount ?? formatEditCount)(editCount)}
      </div>
      <div class="iw-data-grid-edits-actions">
        ${Button.render({
          children: props.resetLabel ?? "Reset",
          variant: "ghost",
          size: "sm",
          onClick: () => props.onEditsReset?.(),
        })}
        ${Button.render({
          children: props.saveLabel ?? "Save changes",
          color: "primary",
          size: "sm",
          onClick: () => props.onEditsSave?.(),
        })}
      </div>
    </div>`
  },

  /**
   * Renders pagination controls for the grid footer.
   * Override to provide custom paging UI.
   * @param {DataGridProps} props The data grid props.
   * @param {object} pagination The pagination info object from `getPaginationInfo`.
   * @returns {TemplateResult} The rendered pagination controls.
   */
  renderPagination(props, paginationInfo) {
    return html`<div class="iw-data-grid-row">
      ${Pagination.renderControl(
        {
          buttonSize: "sm",
          buttonVariant: "outline",
          itemClassName: "iw-data-grid-pagination-button",
          formatPageLabel: props.formatPageLabel,
        },
        {
          label: "«",
          target: FIRST_PAGE + PRETTY_PAGE,
          isDisabled: !paginationInfo.hasPrevPage,
          onChange: () => props.onPageChange?.(FIRST_PAGE),
        },
      )}
      ${Pagination.renderControl(
        {
          buttonSize: "sm",
          buttonVariant: "outline",
          itemClassName: "iw-data-grid-pagination-button",
          formatPageLabel: props.formatPageLabel,
        },
        {
          label: "‹",
          target: Math.max(PRETTY_PAGE, paginationInfo.page),
          isDisabled: !paginationInfo.hasPrevPage,
          onChange: () => props.onPagePrev?.(),
        },
      )}
      ${Input.render({
        name: "page",
        ariaLabel: props.pageLabel ?? "Page",
        size: "sm",
        inputType: "number",
        min: 1,
        max: paginationInfo.totalPages,
        value: paginationInfo.page + PRETTY_PAGE,
        onChange: (value) => props.onPageChange?.(Number(value) - PRETTY_PAGE),
      })}
      /
      <span>${paginationInfo.totalPages}</span>
      ${Pagination.renderControl(
        {
          buttonSize: "sm",
          buttonVariant: "outline",
          itemClassName: "iw-data-grid-pagination-button",
          formatPageLabel: props.formatPageLabel,
        },
        {
          label: "›",
          target: Math.min(paginationInfo.totalPages, paginationInfo.page + 2),
          isDisabled: !paginationInfo.hasNextPage,
          onChange: () => props.onPageNext?.(),
        },
      )}
      ${Pagination.renderControl(
        {
          buttonSize: "sm",
          buttonVariant: "outline",
          itemClassName: "iw-data-grid-pagination-button",
          formatPageLabel: props.formatPageLabel,
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
      <div>${props.pageSizeLabel ?? "Page size"}</div>
      ${Select.render({
        ariaLabel: props.pageSizeLabel ?? "Page size",
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

/**
 * A date, in whatever form a row keeps it, as a date field shows it.
 * @param {Date|number|string|null|undefined} value
 * @returns {string}
 */
function toDateField(value) {
  if (value == null || value === "") return ""
  if (typeof value === "string") return value.slice(0, DATE_LENGTH)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (part) => String(part).padStart(DATE_PART_LENGTH, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + MONTH_OFFSET)}-${pad(date.getDate())}`
}

/**
 * What a field holds, back in the form the row kept the value in: a number,
 * or a date as a `Date`, a timestamp or a string, as it was. A date that had
 * a time of day keeps it.
 * @param {string} text
 * @param {string} type The column's type.
 * @param {any} saved The row's own value.
 * @returns {any}
 */
function fromField(text, type, saved) {
  if (type === "number") return text === "" ? null : Number(text)
  if (type !== "date") return text
  if (text === "") return null
  if (!(saved instanceof Date) && typeof saved !== "number") return text

  const [year, month, day] = text.split("-").map(Number)
  const date = new Date(saved)
  date.setFullYear(year, month - MONTH_OFFSET, day)
  return saved instanceof Date ? date : date.getTime()
}

/**
 * Selects or moves between rows from the keyboard. Keys pressed in a cell's
 * field stay the field's.
 * @param {KeyboardEvent} event
 * @param {DataGridProps} props
 * @param {string|number} rowId
 */
function handleRowKeydown(event, props, rowId) {
  if (event.target !== event.currentTarget) return

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault()
    props.onRowClick?.({
      rowId,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey || event.key === " ",
    })
    return
  }

  const rows = [
    ...event.currentTarget
      .closest(".iw-data-grid-body")
      .querySelectorAll(".iw-data-grid-row"),
  ]
  const target = getRowToFocus(
    rows,
    rows.indexOf(event.currentTarget),
    event.key,
  )
  if (!target) return

  event.preventDefault()
  target.focus()
}

/**
 * The row a navigation key moves focus to, if any.
 * @param {HTMLElement[]} rows
 * @param {number} current
 * @param {string} key
 * @returns {HTMLElement|undefined}
 */
function getRowToFocus(rows, current, key) {
  if (key === "Home") return rows[FIRST_ROW]
  if (key === "End") return rows.at(LAST_ROW)
  if (key in ROW_STEPS) return rows[current + ROW_STEPS[key]]
}

/**
 * The footer's default count of the rows shown.
 * @param {{ start: number, end: number, total: number }} range
 * @returns {string}
 */
function formatRange({ start, end, total }) {
  if (!total) return "0 entries"
  return `${start} to ${end} of ${total} entries`
}

/**
 * The edits bar's default count of the unsaved edits.
 * @param {number} count
 * @returns {string}
 */
function formatEditCount(count) {
  return `${count} ${count === ONE_EDIT ? "change" : "changes"}`
}
