import { createStore } from "@inglorious/store"

import type { AppEntity, AppEvents, AppState } from "../../types"
import { Message } from "../app/message"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore<AppEntity, AppState, AppEvents>({
  types: { Message },
  entities,
  middlewares,
})
