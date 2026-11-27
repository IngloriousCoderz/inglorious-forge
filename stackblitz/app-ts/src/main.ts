import { mount } from "@inglorious/web"

import type { AppApi } from "../types"
import { App } from "./app"
import { store } from "./store"

mount(
  store,
  (api: AppApi) => App.render(null, api),
  document.getElementById("root")!,
)
