import { agGrid } from "@inglorious/ag-grid"
import { createStore } from "@inglorious/web"

import { gridDemo } from "../types/grid-demo/index.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { grid: [agGrid, gridDemo] },
  entities,
  middlewares,
})
