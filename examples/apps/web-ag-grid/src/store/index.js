import { AgGrid } from "@inglorious/ag-grid"
import { createStore } from "@inglorious/store"

import { GridDemo } from "../types/grid-demo/index.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { Grid: [AgGrid, GridDemo] },
  entities,
  middlewares,
})
