import { withMotion } from "@inglorious/motion"

import * as handlers from "./handlers.js"
import * as renderers from "./template.js"

const SharedPillBase = { ...handlers, ...renderers }

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
