import { bar } from "../cartesian/bar.js"
import { logic } from "../logic.js"
import { rendering } from "../rendering.js"

export const barChart = {
  ...logic,
  ...rendering,
  ...bar,
}
