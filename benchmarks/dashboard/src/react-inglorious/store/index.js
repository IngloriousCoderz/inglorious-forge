import { createStore } from "@inglorious/store"

import { CHARTS } from "@/charts"

import { metrics } from "../types/metrics"
import { table } from "../types/table"

export const store = createStore({
  types: { metrics, table },
  entities: CHARTS,
  autoCreateEntities: true,
})
