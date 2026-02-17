/* eslint-disable no-magic-numbers */
import { getAgGridRuntimeConfig } from "./runtime-config.js"

const gridInstances = new Map()
const apiIds = new WeakMap()
let nextApiId = 1
let modulesRegistered = false

/**
 * @typedef {Record<string, any> & {
 *   id: string
 *   rowIdField?: string
 *   defaultColDef?: Record<string, any>
 *   rowData?: any[]
 *   columnDefs?: any[]
 *   gridOptions?: Record<string, any>
 * }} AgGridEntity
 */

/**
 * @typedef {{
 *   api: any
 *   element: HTMLElement
 *   lastColumnDefs: any[] | undefined
 *   lastGridOptions: Record<string, any> | undefined
 *   lastRowData: any[] | undefined
 *   lastDefaultColDef: Record<string, any> | undefined
 * }} GridInstance
 */

/**
 * Mounts a grid instance for an entity, or updates the existing instance.
 * @param {AgGridEntity} entity
 * @param {HTMLElement} element
 * @param {{ notify: (event: string, payload?: any) => void }} api
 */
export function mountOrUpdateGrid(entity, element, api) {
  registerModulesOnce()

  const existing = gridInstances.get(entity.id)

  if (!existing || existing.element !== element) {
    if (existing) {
      existing.api.destroy()
      gridInstances.delete(entity.id)
    }

    const gridApi = getAgGridRuntimeConfig().createGrid(
      element,
      buildGridOptions(entity),
    )

    gridInstances.set(entity.id, {
      api: gridApi,
      element,
      lastColumnDefs: entity.columnDefs,
      lastGridOptions: entity.gridOptions,
      lastRowData: entity.rowData,
      lastDefaultColDef: entity.defaultColDef,
    })

    const entityId = entity.id
    queueMicrotask(() => {
      api.notify(`#${entityId}:mounted`, {
        gridApiId: getApiId(gridApi),
      })
    })
    return
  }

  syncGrid(existing, entity)
}

/**
 * Destroys grid runtime state for the provided entity id.
 * @param {string} entityId
 */
export function destroyGrid(entityId) {
  const instance = gridInstances.get(entityId)
  if (!instance) return
  instance.api.destroy()
  gridInstances.delete(entityId)
}

function registerModulesOnce() {
  if (modulesRegistered) return
  getAgGridRuntimeConfig().registerModules?.()
  modulesRegistered = true
}

/**
 * Builds AG Grid options from entity state and passthrough options.
 * @param {AgGridEntity} entity
 * @returns {Record<string, any>}
 */
function buildGridOptions(entity) {
  const options = entity.gridOptions || {}

  return {
    ...options,
    defaultColDef: entity.defaultColDef,
    animateRows: options.animateRows ?? true,
    rowData: entity.rowData,
    columnDefs: entity.columnDefs,
    getRowId:
      options.getRowId ||
      ((params) => String(params.data?.[entity.rowIdField])),
  }
}

/**
 * Applies incremental grid updates when tracked entity fields change.
 * @param {GridInstance} instance
 * @param {AgGridEntity} entity
 */
function syncGrid(instance, entity) {
  const hasChanges =
    instance.lastDefaultColDef !== entity.defaultColDef ||
    instance.lastGridOptions !== entity.gridOptions ||
    instance.lastRowData !== entity.rowData ||
    instance.lastColumnDefs !== entity.columnDefs

  if (!hasChanges) return

  instance.api.updateGridOptions(buildGridOptions(entity))

  instance.lastDefaultColDef = entity.defaultColDef
  instance.lastGridOptions = entity.gridOptions
  instance.lastRowData = entity.rowData
  instance.lastColumnDefs = entity.columnDefs
}

/**
 * Invokes a method on the underlying AG Grid API.
 * @param {string} entityId
 * @param {string | { method: string, args?: any[] }} payload
 */
export function callGridApi(entityId, payload) {
  const instance = gridInstances.get(entityId)
  if (!instance || !instance.api) return

  const method = typeof payload === "string" ? payload : payload?.method
  if (!method || typeof instance.api[method] !== "function") return

  const args =
    typeof payload === "object" && Array.isArray(payload.args)
      ? payload.args
      : []
  instance.api[method](...args)
}

/**
 * Returns a stable numeric identifier for a grid API instance.
 * @param {any} api
 * @returns {number}
 */
function getApiId(api) {
  if (!apiIds.has(api)) {
    apiIds.set(api, nextApiId)
    nextApiId += 1
  }

  return apiIds.get(api)
}
