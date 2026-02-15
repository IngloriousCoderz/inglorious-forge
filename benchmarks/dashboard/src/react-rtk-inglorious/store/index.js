import { createStore } from "@inglorious/store"

import { data } from "./data.slice"
import { metrics } from "./metrics.slice"

export const store = createStore({
  types: { data, metrics },
  autoCreateEntities: true,
})
