import { createStore } from "@inglorious/store"

import type { AppEntity, AppState } from "../../types"
import { Message } from "../types/message"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore<AppEntity, AppState>({
  types: { Message },
  entities,
  middlewares,
})
