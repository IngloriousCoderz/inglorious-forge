import "@benchmarks/dashboard-shared/style.css"

import { createPinia } from "pinia"
import { createApp } from "vue"

import App from "./App.vue"

const app = createApp(App)
app.use(createPinia())
app.mount("#app")
