import { mount } from "@inglorious/web"
import "@inglorious/web/ag-grid/base.css"
import "@inglorious/web/ag-grid/quartz.css"
import "@inglorious/web/ag-grid/theme.css"

import { app } from "./app.js"
import { store } from "./store/index.js"

mount(store, app.render, document.getElementById("root"))
