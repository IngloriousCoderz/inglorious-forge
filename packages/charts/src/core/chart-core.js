import { area } from "../cartesian/area.js"
import { bar } from "../cartesian/bar.js"
import { line } from "../cartesian/line.js"
import * as handlers from "../handlers.js"
import { donut } from "../polar/donut.js"
import { pie } from "../polar/pie.js"

const NOOP = () => {}

/**
 * Core chart renderers (store-agnostic).
 * These renderers accept plain props and do not require an external store api.
 * Useful as an initial step toward a pure presentational charts layer.
 */
export const coreCharts = {
  line: buildPureChart("line", line),
  area: buildPureChart("area", area),
  bar: buildPureChart("bar", bar),
  pie: buildPureChart("pie", pie),
  donut: buildPureChart("donut", donut),
}

function buildPureChart(typeName, typeRenderer) {
  const chartRuntime = buildChartRuntime(typeName, typeRenderer)
  const draw = (props = {}) => {
    const chartModel = buildChartModel(typeName, props)
    return typeRenderer.render(chartModel, chartRuntime)
  }

  return {
    /**
     * Render a chart from plain props (no store required).
     * @param {Record<string, any>} props
     */
    render: draw,
    draw,
  }
}

function buildChartRuntime(typeName, typeRenderer) {
  const registry = { [typeName]: typeRenderer }
  return {
    getType(name) {
      return registry[name]
    },
    notify: NOOP,
  }
}

function buildChartModel(typeName, props) {
  const chartModel = {
    id: props.id || `core-${typeName}`,
    type: typeName,
    ...props,
  }

  // Reuse default chart initialization without requiring store wiring.
  handlers.create(chartModel)
  return chartModel
}
