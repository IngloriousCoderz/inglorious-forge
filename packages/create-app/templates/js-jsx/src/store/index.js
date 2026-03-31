import { createStore } from "@inglorious/web"

import { Message } from "../types/message"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { Message },
  entities,
  middlewares,
})
