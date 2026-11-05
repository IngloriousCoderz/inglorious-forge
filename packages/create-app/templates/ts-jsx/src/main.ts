import { mount } from "@inglorious/web"

import { App } from "./app"
import { store } from "./store"

mount(store, App.render, document.getElementById("root")!)
