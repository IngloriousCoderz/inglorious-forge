import { createStore } from "@inglorious/store"

import type { AppEntity, AppState } from "../../types"
// @ts-expect-error - Handled by @inglorious/vite-plugin-vue
import { Message } from "../types/message.vue"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore<AppEntity, AppState>({
  types: { Message },
  entities,
  middlewares,
})
