import { createStore } from "@inglorious/store"

import { Message } from "../app/message/index.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { Message },
  entities,
  middlewares,
})
