import { createStore } from "@inglorious/web"

import { message } from "../message/message.vue"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { message },
  entities,
  middlewares,
})
