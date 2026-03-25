import "./style.css"

import { areaChart, barChart, lineChart } from "@inglorious/charts"

import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { appDrawer } from "./app-drawer.js"
import { dashboard } from "./dashboard.js"
import { dashboardJsx } from "./dashboard-jsx.jsx"
// import { dashboardVue } from "./dashboard-vue.vue"
import { mode } from "./mode.js"
import { primitiveSection } from "./primitive-section.js"
import { theme } from "./theme.js"

const baseTypes = {
  theme,
  mode,
  appDrawer,
  primitiveSection,
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
    dashboard,
  }),
  args: {
    id: "dashboard",
    type: "dashboard",
  },
}

export const Jsx = {
  render: createEntityRender({
    ...baseTypes,
    dashboard: dashboardJsx,
  }),
  args: {
    id: "dashboard",
    type: "dashboard",
  },
}

// export const Vue = {
//   render: createEntityRender({
//     ...baseTypes,
//     dashboard: dashboardVue,
//   }),
//   args: {
//     id: "dashboard",
//     type: "dashboard",
//   },
// }
