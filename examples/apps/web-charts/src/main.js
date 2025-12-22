import { mount } from "@inglorious/web"
import "@inglorious/web/charts/base.css"
import "@inglorious/web/charts/theme.css"

import { app } from "./app.js"
import { store } from "./store/index.js"

mount(store, app.render, document.getElementById("root"))
