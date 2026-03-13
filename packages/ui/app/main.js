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
import { mount } from "@inglorious/web"

import { appDrawer } from "../src/examples/dashboard/app-drawer.js"
import { dashboard } from "../src/examples/dashboard/dashboard.js"

const store = createStore({
  types: {
    dashboard,
    appDrawer,
    area: areaChart,
    bar: barChart,
    line: lineChart,
  },
  autoCreateEntities: true,
})

applyTheme("inglorious", "dark")

const root = document.getElementById("app")
mount(store, (api) => api.render("dashboard"), root)

function applyTheme(theme, mode) {
  const themeClass = `iw-theme-${theme}`
  const modeClass = mode === "light" ? "iw-theme-light" : "iw-theme-dark"

  document.body.className = document.body.className.replace(
    /iw-theme-(\w+)/g,
    "",
  )
  document.body.classList.add(themeClass, modeClass)

  const background =
    getComputedStyle(document.body).getPropertyValue("--iw-color-bg").trim() ||
    (mode === "dark" ? "#111827" : "#ffffff")
  const foreground =
    getComputedStyle(document.body)
      .getPropertyValue("--iw-color-text")
      .trim() || (mode === "dark" ? "#f9fafb" : "#111827")

  document.body.style.backgroundColor = background
  document.body.style.color = foreground
}
