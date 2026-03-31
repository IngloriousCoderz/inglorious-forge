import { createStore } from "@inglorious/web"

import { Message } from "../types/message.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { Message },
  entities,
  middlewares,
})
