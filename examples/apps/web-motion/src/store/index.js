import { createStore } from "@inglorious/web"

import { types } from "../types/index.js"
import { entities } from "./entities.js"

export const store = createStore({
  entities,
  types,
})
