import { mount } from "@inglorious/web"

import { app } from "./app.vue"
import { store } from "./store"

mount(store, (api) => app.render(null, api), document.getElementById("root"))
