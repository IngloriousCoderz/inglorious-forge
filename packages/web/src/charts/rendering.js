import { svg } from "lit-html"

import { getChartType } from "./registry.js"

export const rendering = {
  render(entity, api) {
    const chart = getChartType(entity.type)
    if (!chart) {
      return svg`<text x="50%" y="50%" text-anchor="middle" fill="#999">Unknown chart type</text>`
    }
    return chart.renderChart(entity, api)
  },
}
