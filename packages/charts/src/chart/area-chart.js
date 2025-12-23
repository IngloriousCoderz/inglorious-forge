import { area } from "../cartesian/area.js"
import { logic } from "../logic.js"
import { rendering } from "../rendering.js"

export const areaChart = {
  ...logic,
  ...rendering,
  ...area,
}
