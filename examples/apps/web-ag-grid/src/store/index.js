import { agGrid, createStore } from "@inglorious/web"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { "grid": agGrid },
  entities,
  middlewares,
})
