import { configureStore } from "@reduxjs/toolkit"

import charts from "./charts.slice"
import table from "./data.slice"
import metrics from "./metrics.slice"

export const store = configureStore({
  reducer: { table, metrics, charts },
})
