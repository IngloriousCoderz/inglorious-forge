import { withMotion } from "@inglorious/motion"

import * as handlers from "./handlers.js"
import { render } from "./template.js"

const motionPanelBase = { ...handlers, render }

export const motionPanel = [
  motionPanelBase,
  withMotion({
    classPrefix: "demo-motion",
    initial: "visible",
    variants: {
      visible: {
        frames: [
          { opacity: 0.35, transform: "translateY(14px) scale(0.985)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        options: { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      },
      hidden: {
        frames: [
          { opacity: 1, transform: "translateY(0) scale(1)" },
          { opacity: 0.45, transform: "translateY(6px) scale(0.99)" },
        ],
        options: { duration: 180, easing: "ease-in-out" },
      },
      exit: {
        frames: [
          { opacity: 1, transform: "translateX(0)" },
          { opacity: 0, transform: "translateX(18px)" },
        ],
        options: { duration: 160, easing: "ease-in" },
      },
    },
  }),
]
