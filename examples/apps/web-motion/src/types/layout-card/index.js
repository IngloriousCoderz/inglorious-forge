import { withMotion } from "@inglorious/motion"

import * as handlers from "./handlers.js"
import * as renderers from "./template.js"

const LayoutCardBase = { ...handlers, ...renderers }

export const LayoutCard = [
  LayoutCardBase,
  withMotion({
    classPrefix: "demo-layout-card",
    layout: true,
    variants: {
      visible: {
        frames: [{ transform: "scale(1)" }, { transform: "scale(1)" }],
        options: { duration: 120, easing: "linear" },
      },
      focused: {
        frames: [{ transform: "scale(1)" }, { transform: "scale(1.04)" }],
        options: { duration: 180, easing: "ease-out" },
      },
    },
  }),
]
