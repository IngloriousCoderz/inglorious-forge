import { withMotion } from "@inglorious/motion"

import * as handlers from "./handlers.js"
import { template } from "./template.js"

const SharedPillBase = { ...handlers, ...template }

export const SharedPill = [
  SharedPillBase,
  withMotion({
    classPrefix: "demo-shared",
    layout: true,
    variants: {
      visible: {
        frames: [{ opacity: 1 }, { opacity: 1 }],
        options: { duration: 80, easing: "linear" },
      },
    },
  }),
]
