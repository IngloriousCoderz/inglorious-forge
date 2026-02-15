import { createStore } from "@inglorious/store"

import { metrics } from "../types/metrics"
import { table } from "../types/table"
import { entities } from "./entities"

export const store = createStore({
  types: { metrics, table },
  entities,
  autoCreateEntities: true,
})
