import { logic } from "../logic.js"
import { donut } from "../polar/donut.js"
import { rendering } from "../rendering.js"

export const donutChart = {
  ...logic,
  ...rendering,
  ...donut,
}
