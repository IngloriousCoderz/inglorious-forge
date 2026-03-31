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

import { AppDrawer } from "../src/examples/dashboard/app-drawer.js"
import { Dashboard } from "../src/examples/dashboard/dashboard.js"
import { Mode } from "../src/examples/dashboard/mode.js"
import { PrimitiveSection } from "../src/examples/dashboard/primitive-section.js"
import { Router } from "../src/examples/dashboard/router.js"
import { Theme } from "../src/examples/dashboard/theme.js"

const store = createStore({
  types: {
    Router,
    Theme,
    Mode,
    AppDrawer,
    Dashboard,
    PrimitiveSection,
    area: areaChart,
    bar: barChart,
    line: lineChart,
  },
  autoCreateEntities: true,
  middlewares: [createDevtools().middleware],
})

const root = document.getElementById("app")
mount(store, (api) => api.render("dashboard"), root)
