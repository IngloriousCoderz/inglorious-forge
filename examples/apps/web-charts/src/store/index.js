import { createStore } from "@inglorious/web"
import { line, bar, pie, donut } from "@inglorious/web"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { line, bar, pie, donut },
  entities,
  middlewares,
})
