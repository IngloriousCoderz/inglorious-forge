import "./assets/style.css"

import { mount } from "@inglorious/web"

import { app } from "./components/app"
import { store } from "./store"

mount(store, app.render, document.getElementById("root"))
