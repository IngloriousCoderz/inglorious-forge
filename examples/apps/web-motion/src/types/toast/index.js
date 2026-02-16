import { withMotion } from "@inglorious/motion"

import * as handlers from "./handlers.js"
import { render } from "./template.js"

const toastBase = { ...handlers, render }

export const toast = [
  toastBase,
  withMotion({
    classPrefix: "demo-toast",
    initial: "visible",
    exitVariant: "exit",
    variants: {
      visible: {
        frames: [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        options: { duration: 220, easing: "ease-out" },
      },
      exit: {
        frames: [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-10px)" },
        ],
        options: { duration: 170, easing: "ease-in" },
      },
    },
  }),
]
