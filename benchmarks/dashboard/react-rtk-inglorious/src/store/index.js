import { createStore } from "@inglorious/store"

import { CHARTS } from "@benchmarks/dashboard-shared"
import { Table } from "./data.slice"
import { Metrics } from "./metrics.slice"

export const store = createStore({
  types: {
    Table,
    Metrics,
    Chart: {},
  },
  entities: {
    table: { id: "table", type: "Table" },
    metrics: { id: "metrics", type: "Metrics" },
    ...CHARTS,
  },
})
