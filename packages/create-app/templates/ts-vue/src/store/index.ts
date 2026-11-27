import { createStore } from "@inglorious/store"

// @ts-expect-error - Handled by @inglorious/vite-plugin-vue
import { Message } from "@/app/message/index.vue"
import type { AppEntity, AppState } from "#types"

import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore<AppEntity, AppState>({
  types: { Message },
  entities,
  middlewares,
})
