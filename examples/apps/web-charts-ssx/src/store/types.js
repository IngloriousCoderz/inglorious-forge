import { Chart } from "@inglorious/charts"

// One Chart type per family; the entity's data/props drive what renders.
export const types = {
  Line: Chart,
  Area: Chart,
  Bar: Chart,
  Pie: Chart,
  Donut: Chart,
}
