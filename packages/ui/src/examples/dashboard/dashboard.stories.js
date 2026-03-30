import "./style.css"

import { areaChart, barChart, lineChart } from "@inglorious/charts"

import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { AppDrawer } from "./app-drawer.js"
import { AppHeader } from "./app-header.js"
import { Dashboard } from "./dashboard.js"
import { DashboardJsx } from "./dashboard-jsx.jsx"
import { DashboardVue } from "./dashboard-vue.vue"
import { Mode } from "./mode.js"
import { PrimitiveSection } from "./primitive-section.js"
import { Theme } from "./theme.js"

const baseTypes = {
  Theme,
  Mode,
  AppDrawer,
  AppHeader,
  PrimitiveSection,
  area: areaChart,
  bar: barChart,
  line: lineChart,
}

export default {
  title: "Examples/AdminDashboard",
  tags: ["autodocs"],
  argTypes: {
    ...notifyActionArgType,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A composed admin dashboard example built from existing navigation, surface, data-display, feedback, and chart primitives.",
      },
    },
  },
}

export const Default = {
  render: createEntityRender({
    ...baseTypes,
    Dashboard,
  }),
  args: {
    id: "dashboard",
    type: "Dashboard",
  },
}

export const Jsx = {
  render: createEntityRender({
    ...baseTypes,
    Dashboard: DashboardJsx,
  }),
  args: {
    id: "dashboard",
    type: "Dashboard",
  },
}

export const Vue = {
  render: createEntityRender({
    ...baseTypes,
    Dashboard: DashboardVue,
  }),
  args: {
    id: "dashboard",
    type: "dashboard",
  },
}
