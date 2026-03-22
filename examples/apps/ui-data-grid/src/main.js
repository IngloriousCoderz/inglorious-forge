import "@inglorious/ui/base.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/data-grid.css"

import { mount } from "@inglorious/web"

import { app } from "./app"
import { store } from "./store"

mount(store, app.render, document.getElementById("root"))
