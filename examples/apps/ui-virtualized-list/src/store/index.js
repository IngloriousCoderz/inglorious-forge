import { createStore } from "@inglorious/store"

import { ProductList } from "../product-list/product-list"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { ProductList },
  entities,
  middlewares,
})
