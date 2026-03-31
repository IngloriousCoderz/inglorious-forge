import { createStore } from "@inglorious/web"

import { ProductList } from "../product-list/product-list"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { ProductList },
  entities,
  middlewares,
})
