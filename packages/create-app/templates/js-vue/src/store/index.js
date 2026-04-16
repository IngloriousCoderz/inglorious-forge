import { createStore } from "@inglorious/store"

import { Message } from "../types/message.vue"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { Message },
  entities,
  middlewares,
})
