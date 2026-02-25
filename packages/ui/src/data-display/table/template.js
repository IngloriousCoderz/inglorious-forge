/**
 * @typedef {import('../../../types/data-display/table').TableEntity} TableEntity
 * @typedef {import('../../../types/data-display/table').TableColumn} TableColumn
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

const EVEN_ROW_DIVISOR = 2
const STRIPED_OFFSET = 1

/**
 * @param {TableEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    columns = [],
    rows = [],
    fullWidth = false,
    striped = false,
    ...rest
  } = entity

  const classes = {
    "iw-table": true,
    "iw-table-full-width": fullWidth,
    "iw-table-striped": striped,
  }

  const type = getTableType(entity, api)

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
                type.renderHeaderCell(entity, { column, index }, api),
            )}
          </tr>
        </thead>
        <tbody>
          ${repeat(
            rows,
            (row, index) => row?.id ?? `${index}`,
            (row, index) => type.renderRow(entity, { row, index }, api),
          )}
        </tbody>
      </table>
    </div>
  `
}

/**
 * @param {TableEntity} _entity
 * @param {{column: TableColumn, index: number}} payload
 * @returns {TemplateResult}
 */
export function renderHeaderCell(_entity, { column }) {
  const title = column.label ?? column.title ?? column.id
  return html`<th class="iw-table-header-cell">${title}</th>`
}

/**
 * @param {TableEntity} entity
 * @param {{row: Record<string, unknown>, index: number}} payload
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function renderRow(entity, { row, index }, api) {
  const columns = entity.columns ?? []
  const type = getTableType(entity, api)

  return html`<tr
    class=${classMap({
      "iw-table-row": true,
      "iw-table-row-even": index % EVEN_ROW_DIVISOR === STRIPED_OFFSET,
    })}
    @click=${() => api.notify(`#${entity.id}:rowClick`, row)}
  >
    ${repeat(
      columns,
      (column, columnIndex) => column.id ?? `${columnIndex}`,
      (column, columnIndex) =>
        type.renderCell(entity, { column, row, index, columnIndex }, api),
    )}
  </tr>`
}

/**
 * @param {TableEntity} _entity
 * @param {{column: TableColumn, row: Record<string, unknown>}} payload
 * @returns {TemplateResult}
 */
export function renderCell(_entity, { column, row }) {
  const value = row?.[column.id]

  return html`<td
    class=${classMap({
      "iw-table-cell": true,
      "iw-table-cell-number": column.align === "right",
    })}
  >
    ${value}
  </td>`
}

function getTableType(entity, api) {
  const resolved = api?.getType?.(entity?.type)

  if (
    typeof resolved?.renderHeaderCell === "function" &&
    typeof resolved?.renderRow === "function" &&
    typeof resolved?.renderCell === "function"
  ) {
    return resolved
  }

  return { renderHeaderCell, renderRow, renderCell }
}
