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

const financeTable = {
  ...table,
  screenerDataSet(entity, rows) {
    entity.data = rows
  },
}

export const store = createStore({
  types: {
    router,
    financeTable,
    line: lineChart,
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
