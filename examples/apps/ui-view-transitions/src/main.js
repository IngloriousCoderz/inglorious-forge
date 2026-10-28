import "./style.css"
import "@inglorious/ui/base.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/container.css"
import "@inglorious/ui/app-bar.css"
import "@inglorious/ui/card.css"
import "@inglorious/ui/button.css"
import "@inglorious/ui/typography.css"
import "@inglorious/ui/view-transitions.css"

import { mount } from "@inglorious/web"

import { app } from "./app.js"
import { store } from "./store/index.js"

mount(store, app.render, document.getElementById("root"))
