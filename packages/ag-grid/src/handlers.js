import { DEFAULT_COL_DEF, DEFAULT_THEME_CLASS } from "./defaults.js"
import { callGridApi, destroyGrid } from "./runtime.js"

/**
 * @typedef {Record<string, any> & {
 *   id: string
 *   rowIdField?: string
 *   themeClass?: string
 *   height?: number | string
 *   defaultColDef?: Record<string, any>
 *   rowData?: any[]
 *   columnDefs?: any[]
 *   gridOptions?: Record<string, any>
 *   gridApiId?: string | number | null
 *   gridStatus?: string
 * }} AgGridEntity
 */

/**
 * Initializes an AG Grid entity with adapter defaults.
 * @param {AgGridEntity} entity
 */
export function create(entity) {
  entity.rowIdField ??= "id"
  entity.themeClass ??= DEFAULT_THEME_CLASS
  entity.height ??= 520
  entity.defaultColDef = {
    ...DEFAULT_COL_DEF,
    ...(entity.defaultColDef || {}),
  }
  entity.gridApiId ??= null
  entity.gridStatus ??= "mounting"
  entity.rowData ??= []
  entity.columnDefs ??= []
  entity.gridOptions ??= {}
}

/**
 * Marks runtime mount completion and stores a stable API id.
 * @param {AgGridEntity} entity
 * @param {{ gridApiId?: string | number }} [payload]
 */
export function mounted(entity, payload) {
  entity.gridApiId = payload?.gridApiId ?? entity.gridApiId
  entity.gridStatus = "mounted"
}

/**
 * Replaces the grid row data.
 * @param {AgGridEntity} entity
 * @param {any[]} rowData
 */
export function rowDataChange(entity, rowData) {
  entity.rowData = rowData
}

/**
 * Replaces the grid column definitions.
 * @param {AgGridEntity} entity
 * @param {any[]} columnDefs
 */
export function columnDefsChange(entity, columnDefs) {
  entity.columnDefs = columnDefs
}

/**
 * Replaces passthrough AG Grid options.
 * @param {AgGridEntity} entity
 * @param {Record<string, any>} gridOptions
 */
export function gridOptionsChange(entity, gridOptions) {
  entity.gridOptions = gridOptions
}

/**
 * Invokes a grid API method by name.
 * @param {AgGridEntity} entity
 * @param {string | { method: string, args?: any[] }} payload
 */
export function apiCall(entity, payload) {
  callGridApi(entity.id, payload)
}

// Backward-compatible aliases.
export const gridMounted = mounted
export const setRowData = rowDataChange
export const setColumnDefs = columnDefsChange
export const setGridOptions = gridOptionsChange

/**
 * Disposes runtime resources for this entity.
 * @param {AgGridEntity} entity
 */
export function destroy(entity) {
  destroyGrid(entity.id)
}
