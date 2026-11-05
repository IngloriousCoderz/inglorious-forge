import { mount } from "@inglorious/web"

import type { AppApi } from "../types"
// @ts-expect-error - Handled by @inglorious/vite-plugin-vue
import { App } from "./app/index.vue"
import { store } from "./store"

mount(
  store,
  (api: AppApi) => App.render(null, api),
  document.getElementById("root")!,
)
