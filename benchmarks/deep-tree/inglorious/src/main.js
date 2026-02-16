import "@benchmarks/deep-tree-shared/style.css"

import { mount } from "@inglorious/web"

import { store } from "./store/index"
import { app } from "./types/app"

mount(store, app.render, document.getElementById("root"))
