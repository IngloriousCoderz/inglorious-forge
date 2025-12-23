import { pie } from "../cartesian/pie.js"
import { logic } from "../logic.js"
import { rendering } from "../rendering.js"

export const pieChart = {
  ...logic,
  ...rendering,
  ...pie,
}
