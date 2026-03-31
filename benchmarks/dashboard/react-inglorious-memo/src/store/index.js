import { createStore } from "@inglorious/store"

import { CHARTS } from "@benchmarks/dashboard-shared"

import { Metrics } from "../types/metrics"
import { Table } from "../types/table"

export const store = createStore({
  types: { Metrics, Table },
  entities: CHARTS,
  autoCreateEntities: true,
})
