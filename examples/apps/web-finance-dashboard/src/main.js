import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"
import "@inglorious/ui/data-grid.css"

import { mount } from "@inglorious/web"

import { app } from "./app.js"
import { store } from "./store/index.js"

mount(store, app.render, document.getElementById("root"))
