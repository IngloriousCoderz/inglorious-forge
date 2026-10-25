import "@benchmarks/deep-tree-shared/style.css"

import { mount } from "svelte"

import App from "./app.svelte"

mount(App, {
  target: document.getElementById("app"),
})
