/**
 * @typedef {import('../../../types/data-display/table').TableProps} TableProps
 * @typedef {import('../../../types/data-display/table').TableColumn} TableColumn
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

const EVEN_ROW_DIVISOR = 2
const STRIPED_OFFSET = 1

export const table = {
  /**
   * @param {TableProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      columns = [],
      rows = [],
      fullWidth = false,
      striped = false,
      onRowClick,
      ...rest
    } = props

    const classes = {
      "iw-table": true,
      "iw-table-full-width": fullWidth,
      "iw-table-striped": striped,
    }

    return html`
      <div class="iw-table-wrap">
        <table
          class=${classMap(classes)}
          ${ref((el) => applyElementProps(el, rest))}
        >
          <thead>
            <tr>
              ${repeat(
                columns,
                (column, index) => column.id ?? `${index}`,
                (column, index) =>
                  this.renderHeaderCell(props, { column, index }),
              )}
            </tr>
          </thead>
          <tbody>
            ${repeat(
              rows,
              (row, index) => row?.id ?? `${index}`,
              (row, index) => this.renderRow(props, { row, index, onRowClick }),
            )}
          </tbody>
        </table>
      </div>
    `
  },

  /**
   * @param {TableProps} _props
   * @param {{column: TableColumn, index: number}} payload
   * @returns {TemplateResult}
   */
  renderHeaderCell(_props, { column }) {
    const title = column.label ?? column.title ?? column.id
    return html`<th class="iw-table-header-cell">${title}</th>`
  },

  /**
   * @param {TableProps} props
   * @param {{row: Record<string, unknown>, index: number}} payload
   * @returns {TemplateResult}
   */
  renderRow(props, { row, index, onRowClick }) {
    const columns = props.columns ?? []

    return html`<tr
      class=${classMap({
        "iw-table-row": true,
        "iw-table-row-even": index % EVEN_ROW_DIVISOR === STRIPED_OFFSET,
      })}
      @click=${() => onRowClick(row)}
    >
      ${repeat(
        columns,
        (column, columnIndex) => column.id ?? `${columnIndex}`,
        (column, columnIndex) =>
          this.renderCell(props, { column, row, index, columnIndex }),
      )}
    </tr>`
  },

  /**
   * @param {TableProps} _props
   * @param {{column: TableColumn, row: Record<string, unknown>}} payload
   * @returns {TemplateResult}
   */
  renderCell(_props, { column, row }) {
    const value = row?.[column.id]

    return html`<td
      class=${classMap({
        "iw-table-cell": true,
        "iw-table-cell-number": column.align === "right",
      })}
    >
      ${value}
    </td>`
  },
}
