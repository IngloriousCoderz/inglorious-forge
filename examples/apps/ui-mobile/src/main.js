import "@inglorious/ui/all.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/themes/inglorious.css"
import "@inglorious/ui/themes/ios-18.css"
import "@inglorious/ui/themes/ios-26.css"
import "@inglorious/ui/themes/material-3.css"
import "@inglorious/ui/themes/material-ui.css"
import "@inglorious/ui/view-transitions.css"
import "./style.css"

import { mount } from "@inglorious/web"
import { watchKeyboard } from "@inglorious/web/device/keyboard"

import { app } from "./app.js"
import { store } from "./store/index.js"
import { themeClasses } from "./themes.js"

watchKeyboard()

mount(store, app.render, document.getElementById("root"))

let applied = ""
store.subscribe(applyTheme)
applyTheme()

function applyTheme() {
  const classes = themeClasses(store.getEntity("settings"))
  if (classes === applied) return
  applied = classes
  document.body.className = classes
}
