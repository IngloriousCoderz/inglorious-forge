import { withMotion } from "@inglorious/motion"

import * as handlers from "./handlers.js"
import * as renderers from "./template.js"

const ToastBase = { ...handlers, ...renderers }

export const Toast = [
  ToastBase,
  withMotion({
    classPrefix: "demo-toast",
    initial: "visible",
    exitVariant: "exit",
    presence: {
      mode: "wait",
    },
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
