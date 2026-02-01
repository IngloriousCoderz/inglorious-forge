import { mount } from "@inglorious/web"

// @ts-expect-error - Handled by @inglorious/vite-plugin-vue
import { app } from "./app.vue"
import { store } from "./store"

mount(store, (api) => app.render(null, api), document.getElementById("root"))
