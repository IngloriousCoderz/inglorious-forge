import { donut } from "../cartesian/donut.js"
import { logic } from "../logic.js"
import { rendering } from "../rendering.js"

export const donutChart = {
  ...logic,
  ...rendering,
  ...donut,
}

