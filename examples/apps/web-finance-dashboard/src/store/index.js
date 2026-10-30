import "./routes.js"

import { Chart } from "@inglorious/charts"
import { createStore } from "@inglorious/store"
import { DataGrid } from "@inglorious/ui/data-grid"
import { Router } from "@inglorious/web/router"

import { AssetPage } from "../pages/asset.js"
import { DashboardPage } from "../pages/dashboard.js"
import { NotFoundPage } from "../pages/not-found.js"
import { ScreenerPage } from "../pages/screener.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

const FIRST = 0
const LAST = -1
const LAST_INDEX_OFFSET = 1
const VISIBLE_WINDOW = 20

export const Line = {
  create: Chart.create,
  dataUpdate(entity, rows) {
    Chart.dataUpdate(entity, rows)
    entity.brush ??= { enabled: true, height: 28 }
    entity.brush.enabled = true

    if (!Array.isArray(rows) || !rows.length) {
      entity.brush.startIndex = FIRST
      entity.brush.endIndex = FIRST
      return
    }

    const endIndex = rows.length - LAST_INDEX_OFFSET
    const startIndex = Math.max(
      FIRST,
      endIndex - VISIBLE_WINDOW + LAST_INDEX_OFFSET,
    )

    entity.brush.startIndex = startIndex
    entity.brush.endIndex = endIndex
  },
  sizeUpdate: Chart.sizeUpdate,
  brushChange: Chart.brushChange,
}

export const FinanceTable = {
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

    const selectedId = entity.selection.at(LAST)
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
    FinanceTable,
    Line,
    DashboardPage,
    ScreenerPage,
    AssetPage,
    NotFoundPage,
  },
  entities,
  middlewares,
  autoCreateEntities: true,
})
