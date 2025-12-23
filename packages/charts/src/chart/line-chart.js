import { line } from "../cartesian/line.js"
import { logic } from "../logic.js"
import { rendering } from "../rendering.js"

export const lineChart = {
  ...logic,
  ...rendering,
  ...line,
}
