import { createStore } from "@inglorious/store"

import { Message } from "@/app/message"
import type { AppEntity, AppEvents, AppState } from "#types"

import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore<AppEntity, AppState, AppEvents>({
  types: { Message },
  entities,
  middlewares,
})
