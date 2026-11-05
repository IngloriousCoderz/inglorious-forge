import { mount } from "@inglorious/web"

import { App } from "./app/index.vue"
import { store } from "./store"

mount(store, (api) => App.render(null, api), document.getElementById("root"))
