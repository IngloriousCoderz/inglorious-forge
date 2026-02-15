import { configureStore } from "@reduxjs/toolkit"

import data from "./data.slice"
import metrics from "./metrics.slice"

export const store = configureStore({
  reducer: { data, metrics },
})
