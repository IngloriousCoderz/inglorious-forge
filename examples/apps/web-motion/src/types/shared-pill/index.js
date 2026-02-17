import { withMotion } from "@inglorious/motion"

import * as handlers from "./handlers.js"
import { render } from "./template.js"

const sharedPillBase = { ...handlers, render }

export const sharedPill = [
  sharedPillBase,
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
