import { createStore } from "@inglorious/web"

import { productTable } from "../product-table/product-table"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { productTable },
  entities,
  middlewares,
})
