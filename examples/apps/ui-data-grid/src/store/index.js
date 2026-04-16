import { createStore } from "@inglorious/store"

import { ProductTable } from "../product-table/product-table"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { ProductTable },
  entities,
  middlewares,
})
