import { createStore, type TypesConfig } from "@inglorious/web"

import type { AppEntity, AppState } from "../../types"
// @ts-expect-error - Handled by @inglorious/vite-plugin-vue
import { Message } from "../message/message.vue"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore<AppEntity, AppState>({
  types: { Message } as unknown as TypesConfig<AppEntity>,
  entities,
  middlewares,
})
