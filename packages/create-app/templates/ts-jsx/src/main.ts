import { mount } from "@inglorious/web"

import { app } from "./app"
import { store } from "./store"

mount(store, app.render, document.getElementById("root")!)
