import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"

import { mount } from "@inglorious/web"

import { app } from "./app.js"
import { store } from "./store/index.js"
import { startDemoStream } from "./stream-demo.js"

startDemoStream(store)
mount(store, app.render, document.getElementById("root"))
