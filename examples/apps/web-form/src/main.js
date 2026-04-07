import "@inglorious/ui/base.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/button.css"
import "@inglorious/ui/card.css"
import "@inglorious/ui/input.css"
import "@inglorious/ui/select.css"
import "./style.css"

import { mount } from "@inglorious/web"

import { app } from "./app"
import { store } from "./store"

mount(store, app.render, document.getElementById("root"))
