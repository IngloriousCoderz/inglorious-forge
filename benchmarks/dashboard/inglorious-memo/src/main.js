import "@benchmarks/dashboard-shared/style.css"

import { mount } from "@inglorious/web"

import { store } from "./store"
import { app } from "./types/dashboard"

mount(store, app.render, document.getElementById("root"))
