import { logic } from "../logic.js"
import { pie } from "../polar/pie.js"
import { rendering } from "../rendering.js"

export const pieChart = {
  ...logic,
  ...rendering,
  ...pie,
}
