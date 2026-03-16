import "@fontsource/material-symbols-outlined"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "@inglorious/ui/themes/inglorious.css"
import "@inglorious/ui/themes/material.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/all.css"
import "../src/examples/dashboard/style.css"
import "./main.css"

import { areaChart, barChart, lineChart } from "@inglorious/charts"
import { createStore } from "@inglorious/store"
import { createDevtools, mount } from "@inglorious/web"

import { appDrawer } from "../src/examples/dashboard/app-drawer.js"
import { dashboard } from "../src/examples/dashboard/dashboard.js"
import { mode } from "../src/examples/dashboard/mode.js"
import { primitiveSection } from "../src/examples/dashboard/primitive-section.js"
import { router } from "../src/examples/dashboard/router.js"
import { theme } from "../src/examples/dashboard/theme.js"

const store = createStore({
  types: {
    router,
    theme,
    mode,
    appDrawer,
    dashboard,
    primitiveSection,
    area: areaChart,
    bar: barChart,
    line: lineChart,
  },
  autoCreateEntities: true,
  middlewares: [createDevtools().middleware],
})

const root = document.getElementById("app")
mount(store, (api) => api.render("dashboard"), root)
