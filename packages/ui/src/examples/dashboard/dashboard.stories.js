import "./style.css"

import { areaChart, barChart, lineChart } from "@inglorious/charts"

import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { appDrawer } from "./app-drawer.js"
import { dashboard } from "./dashboard.js"
import { mode } from "./mode.js"
import { primitiveSection } from "./primitive-section.js"
import { theme } from "./theme.js"

export default {
  title: "Examples/AdminDashboard",
  tags: ["autodocs"],
  render: createEntityRender({
    theme,
    mode,
    appDrawer,
    dashboard,
    primitiveSection,
    area: areaChart,
    bar: barChart,
    line: lineChart,
  }),
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
  args: {
    id: "dashboard",
    type: "dashboard",
  },
}
