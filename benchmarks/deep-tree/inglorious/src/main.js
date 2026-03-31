import "@benchmarks/deep-tree-shared/style.css"

import { mount } from "@inglorious/web"

import { store } from "./store/index"
import { App } from "./types/app"

mount(store, App.render, document.getElementById("root"))
