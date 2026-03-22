import "./style.css"
import "@inglorious/ui/base.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/combobox.css"

import { mount } from "@inglorious/web"

import { app } from "./app.js"
import { store } from "./store/index.js"

mount(store, app.render, document.getElementById("root"))
