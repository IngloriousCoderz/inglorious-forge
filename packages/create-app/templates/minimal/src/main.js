import { mount } from "@inglorious/web"

import { App } from "./app.js"
import { store } from "./store/index.js"

mount(store, (api) => App.render(null, api), document.getElementById("root"))
