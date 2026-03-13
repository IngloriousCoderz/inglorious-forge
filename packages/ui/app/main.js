import "@fontsource/material-symbols-outlined"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "@inglorious/ui/tokens"
import "@inglorious/ui/themes/inglorious"
import "@inglorious/ui/themes/material"
import "@inglorious/ui/themes/bootstrap"
import "@inglorious/ui/combobox.css"
import "@inglorious/ui/data-grid.css"
import "@inglorious/ui/button.css"
import "@inglorious/ui/button-group.css"
import "@inglorious/ui/checkbox.css"
import "@inglorious/ui/fab.css"
import "@inglorious/ui/icon-button.css"
import "@inglorious/ui/input.css"
import "@inglorious/ui/radio-group.css"
import "@inglorious/ui/rating.css"
import "@inglorious/ui/select.css"
import "@inglorious/ui/slider.css"
import "@inglorious/ui/switch.css"
import "@inglorious/ui/card.css"
import "@inglorious/ui/flex.css"
import "@inglorious/ui/grid.css"
import "@inglorious/ui/accordion.css"
import "@inglorious/ui/app-bar.css"
import "@inglorious/ui/avatar.css"
import "@inglorious/ui/badge.css"
import "@inglorious/ui/chip.css"
import "@inglorious/ui/divider.css"
import "@inglorious/ui/icon.css"
import "@inglorious/ui/list.css"
import "@inglorious/ui/material-icon.css"
import "@inglorious/ui/paper.css"
import "@inglorious/ui/table.css"
import "@inglorious/ui/tooltip.css"
import "@inglorious/ui/typography.css"
import "@inglorious/ui/alert.css"
import "@inglorious/ui/backdrop.css"
import "@inglorious/ui/dialog.css"
import "@inglorious/ui/progress.css"
import "@inglorious/ui/skeleton.css"
import "@inglorious/ui/snackbar.css"
import "@inglorious/ui/container.css"
import "@inglorious/ui/bottom-navigation.css"
import "@inglorious/ui/breadcrumbs.css"
import "@inglorious/ui/drawer.css"
import "@inglorious/ui/link.css"
import "@inglorious/ui/menu.css"
import "@inglorious/ui/pagination.css"
import "@inglorious/ui/speed-dial.css"
import "@inglorious/ui/stepper.css"
import "@inglorious/ui/tabs.css"
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
