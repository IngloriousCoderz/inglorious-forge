import "@benchmarks/dashboard-shared/style.css"

import { mount } from "@inglorious/web"

import { store } from "./store"
import { Dashboard } from "./types/dashboard"

mount(store, Dashboard.render, document.getElementById("root"))
