import { mount } from "@inglorious/web"

// @ts-expect-error - Handled by @inglorious/vite-plugin-vue
import { App } from "./app.vue"
import { store } from "./store"

mount(store, (api) => App.render(null, api), document.getElementById("root"))
