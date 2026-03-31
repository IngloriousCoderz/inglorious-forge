import "./assets/style.css"

import { mount } from "@inglorious/web"

import { App } from "./components/app"
import { store } from "./store"

mount(store, App.render, document.getElementById("root"))
