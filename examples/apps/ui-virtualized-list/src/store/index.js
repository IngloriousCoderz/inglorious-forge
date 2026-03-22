import { createStore } from "@inglorious/web"

import { productList } from "../product-list/product-list"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { productList },
  entities,
  middlewares,
})
