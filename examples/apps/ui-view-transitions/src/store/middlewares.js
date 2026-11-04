import { createDevtools } from "@inglorious/store/client/devtools"
import { withTransitions } from "@inglorious/ui/view-transitions"

import { NO_TAB, tabOf } from "../tabs.js"

export const middlewares = [
  withTransitions({
    direction: ({ type, from, to }) => {
      const fromTab = tabOf(from.route)
      const toTab = tabOf(to.route)
      if (fromTab === NO_TAB || toTab === NO_TAB || fromTab === toTab) {
        return type
      }
      return toTab > fromTab ? "forward" : "back"
    },
  }),
]

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
