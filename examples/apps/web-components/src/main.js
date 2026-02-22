import "@material/web/button/filled-button.js"
import "@material/web/switch/switch.js"

import "@shoelace-style/shoelace/dist/components/button/button.js"
import "@shoelace-style/shoelace/dist/components/switch/switch.js"

import { mount } from "@inglorious/web"

import { store } from "./store.js"

mount(store, (api) => api.render("app"), document.getElementById("root"))
