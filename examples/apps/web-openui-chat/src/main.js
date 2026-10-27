import "@inglorious/ui/all.css"
import "@inglorious/ui/themes/inglorious.css"
import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"
import "./style.css"

import { mount } from "@inglorious/web"

import { app } from "./app.js"
import { store } from "./store.js"

mount(store, app.render, document.getElementById("root"))
