import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"

import { configureAgGrid } from "@inglorious/ag-grid"
import { mount } from "@inglorious/web"
import {
  AllCommunityModule,
  createGrid,
  ModuleRegistry,
} from "ag-grid-community"

import { app } from "./app.js"
import { store } from "./store/index.js"

configureAgGrid({
  createGrid,
  registerModules() {
    ModuleRegistry.registerModules([AllCommunityModule])
  },
})

mount(store, app.render, document.getElementById("root"))
