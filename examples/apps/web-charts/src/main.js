import { mount } from "@inglorious/web"
import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"

import { app } from "./app.js"
import { startDemoStream } from "./stream-demo.js"
import { store } from "./store/index.js"

startDemoStream(store)
mount(store, app.render, document.getElementById("root"))
