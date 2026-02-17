import {
  AllCommunityModule,
  ModuleRegistry,
  createGrid,
} from "ag-grid-community"
import { html } from "lit-html"
import { ref } from "lit-html/directives/ref.js"

const gridInstances = new Map()
const apiIds = new WeakMap()
let nextApiId = 1
let modulesRegistered = false
const DEFAULT_THEME_CLASS = "ag-theme-quartz"
const DEFAULT_COL_DEF = {
  filter: true,
  floatingFilter: true,
  sortable: true,
  resizable: true,
  flex: 1,
  minWidth: 120,
}

const PRICE_BUMP = 15
const VALUE_RANGE = 1000
const METRIC_DIVISOR = 100

export const agGrid = {
  create(entity) {
    entity.title ??= "Data Grid"
    entity.tickCount ??= 0
    entity.rowIdField ??= "id"
    entity.themeClass ??= DEFAULT_THEME_CLASS
    entity.defaultColDef = {
      ...DEFAULT_COL_DEF,
      ...(entity.defaultColDef || {}),
    }
    entity.gridApiId ??= null
    entity.gridStatus ??= "mounting"
  },

  render(entity, api) {
    const instance = gridInstances.get(entity.id)
    const apiId =
      entity.gridApiId ?? (instance ? getApiId(instance.api) : "pending")

    return html`
      <section class="iw-ag-grid">
        <div class="iw-ag-grid-meta">
          <span><b>Entity:</b> ${entity.id}</span>
          <span><b>Render Tick:</b> ${entity.tickCount}</span>
          <span><b>Grid API ID:</b> ${apiId}</span>
          <span><b>Status:</b> ${entity.gridStatus}</span>
        </div>

        <div
          class="${entity.themeClass} iw-ag-grid-host"
          ${ref((el) => {
            if (!el) return
            mountOrUpdateGrid(entity, el, api)
          })}
        ></div>
      </section>
    `
  },

  tick(entity) {
    entity.tickCount += 1
  },

  shuffleRows(entity) {
    const nextRows = [...entity.rowData]
    for (let i = nextRows.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const current = nextRows[i]
      nextRows[i] = nextRows[j]
      nextRows[j] = current
    }
    entity.rowData = nextRows
  },

  bumpPrices(entity) {
    entity.rowData = entity.rowData.map((row) => ({
      ...row,
      price: row.price + PRICE_BUMP,
      rating: Number((row.rating + Math.random()).toFixed(1)),
    }))
  },

  addRow(entity) {
    const id = entity.rowData.length + 1
    const revenue = Math.floor(Math.random() * VALUE_RANGE * 100)
    const growth = Number((Math.random() * 12).toFixed(2))

    entity.rowData = [
      ...entity.rowData,
      {
        id,
        product: `Product ${id}`,
        category: id % 2 === 0 ? "Software" : "Hardware",
        country: id % 3 === 0 ? "Brazil" : "Italy",
        revenue,
        price: Number((revenue / VALUE_RANGE).toFixed(2)),
        rating: Number(((revenue % VALUE_RANGE) / METRIC_DIVISOR).toFixed(1)),
        growth,
      },
    ]
  },

  gridMounted(entity, payload) {
    entity.gridApiId = payload?.gridApiId ?? entity.gridApiId
    entity.gridStatus = "mounted (reused)"
  },

  destroy(entity) {
    const instance = gridInstances.get(entity.id)
    if (!instance) return

    instance.api.destroy()
    gridInstances.delete(entity.id)
  },
}

function mountOrUpdateGrid(entity, element, api) {
  registerModulesOnce()

  const existing = gridInstances.get(entity.id)

  if (!existing || existing.element !== element) {
    if (existing) {
      existing.api.destroy()
      gridInstances.delete(entity.id)
    }

    const gridApi = createGrid(element, buildGridOptions(entity))

    gridInstances.set(entity.id, {
      api: gridApi,
      element,
      lastColumnDefs: entity.columnDefs,
      lastRowData: entity.rowData,
      lastDefaultColDef: entity.defaultColDef,
    })

    queueMicrotask(() => {
      api.notify(`#${entity.id}:gridMounted`, {
        gridApiId: getApiId(gridApi),
      })
    })
    return
  }

  syncGrid(existing, entity)
}

function registerModulesOnce() {
  if (modulesRegistered) return
  ModuleRegistry.registerModules([AllCommunityModule])
  modulesRegistered = true
}

function buildGridOptions(entity) {
  return {
    defaultColDef: entity.defaultColDef,
    animateRows: true,
    rowData: entity.rowData,
    columnDefs: entity.columnDefs,
    getRowId: (params) => String(params.data?.[entity.rowIdField]),
  }
}

function syncGrid(instance, entity) {
  const hasChanges =
    instance.lastDefaultColDef !== entity.defaultColDef ||
    instance.lastRowData !== entity.rowData ||
    instance.lastColumnDefs !== entity.columnDefs

  if (!hasChanges) return

  instance.api.updateGridOptions({
    defaultColDef: entity.defaultColDef,
    rowData: entity.rowData,
    columnDefs: entity.columnDefs,
  })

  instance.lastDefaultColDef = entity.defaultColDef
  instance.lastRowData = entity.rowData
  instance.lastColumnDefs = entity.columnDefs
}

function getApiId(api) {
  if (!apiIds.has(api)) {
    apiIds.set(api, nextApiId)
    nextApiId += 1
  }

  return apiIds.get(api)
}
