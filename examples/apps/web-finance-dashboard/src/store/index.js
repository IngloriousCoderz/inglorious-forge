import "./routes.js"

import { Chart } from "@inglorious/charts"
import { createStore } from "@inglorious/store"
import { Router } from "@inglorious/web/router"
import { DataGrid } from "@inglorious/ui/data-grid"

import { assetPage } from "../pages/asset.js"
import { dashboardPage } from "../pages/dashboard.js"
import { notFoundPage } from "../pages/not-found.js"
import { screenerPage } from "../pages/screener.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

const financeLineType = {
  create: Chart.create,
  dataUpdate(entity, rows) {
    Chart.dataUpdate(entity, rows)
    entity.brush ??= { enabled: true, height: 28 }
    entity.brush.enabled = true

    if (!Array.isArray(rows) || !rows.length) {
      entity.brush.startIndex = 0
      entity.brush.endIndex = 0
      return
    }

    const visibleWindow = 20
    const endIndex = rows.length - 1
    const startIndex = Math.max(0, endIndex - (visibleWindow - 1))

    entity.brush.startIndex = startIndex
    entity.brush.endIndex = endIndex
  },
  sizeUpdate: Chart.sizeUpdate,
  brushChange: Chart.brushChange,
}

export const financeTable = {
  ...DataGrid,
  tableDataSet(entity, rows) {
    entity.rows = Array.isArray(rows) ? rows : []
    entity.selection = []
    if (entity.pagination) entity.pagination.page = 0
  },
  tableSelect(entity, rowId) {
    entity.selection = rowId == null ? [] : [rowId]
  },
  screenerDataSet(entity, rows) {
    entity.rows = Array.isArray(rows) ? rows : []
  },
  rowClick(entity, payload, api) {
    DataGrid.rowClick(entity, payload)
    if (!entity.ownerId || !entity.selectEvent) return

    const selectedId = entity.selection[entity.selection.length - 1]
    const row = entity.rows.find((item) => item[entity.rowId] === selectedId)
    api.notify(`#${entity.ownerId}:${entity.selectEvent}`, {
      rowId: selectedId,
      row,
    })
  },
}

export const store = createStore({
  types: {
    Router,
    financeTable,
    line: financeLineType,
    dashboardPage,
    screenerPage,
    assetPage,
    notFoundPage,
  },
  entities,
  middlewares,
  autoCreateEntities: true,
})
