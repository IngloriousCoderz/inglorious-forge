import "./routes.js"

import { createStore } from "@inglorious/web"
import { router } from "@inglorious/web/router"
import { table } from "@inglorious/web/table"
import { barChart, lineChart, pieChart } from "@inglorious/charts"

import { assetPage } from "../pages/asset.js"
import { dashboardPage } from "../pages/dashboard.js"
import { notFoundPage } from "../pages/not-found.js"
import { screenerPage } from "../pages/screener.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

const financeLine = {
  ...lineChart,
  chartDataSet(entity, rows) {
    entity.data = rows
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
}

const financeTable = {
  ...table,
  tableDataSet(entity, rows) {
    entity.data = rows
    entity.selection = []
    if (entity.pagination) entity.pagination.page = 0
  },
  tableSelect(entity, rowId) {
    entity.selection = rowId == null ? [] : [rowId]
  },
  rowToggle(entity, rowId, api) {
    table.rowToggle(entity, rowId)
    if (!entity.ownerId || !entity.selectEvent) return
    const selectedId = entity.selection[entity.selection.length - 1]
    const row = entity.data.find((item) => item[entity.rowId] === selectedId)
    api.notify(`#${entity.ownerId}:${entity.selectEvent}`, {
      rowId: selectedId,
      row,
    })
  },
  screenerDataSet(entity, rows) {
    // keep backward compatibility with existing screener page handlers
    entity.data = rows
  },
}

export const store = createStore({
  types: {
    router,
    financeTable,
    line: financeLine,
    bar: barChart,
    pie: pieChart,
    dashboardPage,
    screenerPage,
    assetPage,
    notFoundPage,
  },
  entities,
  middlewares,
  autoCreateEntities: true,
})
