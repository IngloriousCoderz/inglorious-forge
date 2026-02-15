import { createStore } from "@inglorious/store"

import { CHARTS } from "../../charts"
import { table } from "./data.slice"
import { metrics } from "./metrics.slice"

export const store = createStore({
  types: {
    table,
    metrics,
    chart: {},
  },
  entities: {
    table: { id: "table", type: "table" },
    metrics: { id: "metrics", type: "metrics" },
    ...CHARTS,
  },
})
