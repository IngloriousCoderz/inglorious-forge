import "./style.css"

import { mount } from "@inglorious/web"

import { App } from "./app.js"
import { store } from "./store/index.js"

mount(store, App.render, document.getElementById("root"))
