/**
 * @typedef {import('../../../types/data-display/table').TableProps} TableProps
 * @typedef {import('../../../types/data-display/table').TableColumn} TableColumn
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

const EVEN_ROW_DIVISOR = 2
const STRIPED_OFFSET = 1

export const table = {
  /**
   * @param {TableProps} props
   * @param {Api} api
   * @returns {TemplateResult}
   */
  render(props, api) {
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
                  this.renderHeaderCell(props, { column, index }, api),
              )}
            </tr>
          </thead>
          <tbody>
            ${repeat(
              rows,
              (row, index) => row?.id ?? `${index}`,
              (row, index) =>
                this.renderRow(props, { row, index, onRowClick }, api),
            )}
          </tbody>
        </table>
      </div>
    `
  },

  /**
   * @param {TableProps} _entity
   * @param {{column: TableColumn, index: number}} payload
   * @returns {TemplateResult}
   */
  renderHeaderCell(_entity, { column }) {
    const title = column.label ?? column.title ?? column.id
    return html`<th class="iw-table-header-cell">${title}</th>`
  },

  /**
   * @param {TableProps} entity
   * @param {{row: Record<string, unknown>, index: number}} payload
   * @param {Api} api
   * @returns {TemplateResult}
   */
  renderRow(entity, { row, index, onRowClick }, api) {
    const columns = entity.columns ?? []

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
          this.renderCell(entity, { column, row, index, columnIndex }, api),
      )}
    </tr>`
  },

  /**
   * @param {TableProps} _entity
   * @param {{column: TableColumn, row: Record<string, unknown>}} payload
   * @returns {TemplateResult}
   */
  renderCell(_entity, { column, row }) {
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
