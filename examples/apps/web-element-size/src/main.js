import "@inglorious/ui/base.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/controls.css"
import "./style.css"

import { mount } from "@inglorious/web"

import { app } from "./app.js"
import { store } from "./store/index.js"

mount(store, app.render, document.getElementById("root"))

// #board is rendered by the app, so it only exists once mount has run.
store.notify("add", {
  id: "boardSize",
  type: "ElementSize",
  selector: "#board",
})
