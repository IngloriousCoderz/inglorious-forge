import { coreCharts } from "./core/chart-core.js"
import {
  createChartInstance,
  createInlineChartInstance,
} from "./core/create-chart-instance.js"
import { createDeclarativeChildren } from "./core/declarative-children.js"
import { getEmptyChartInstance } from "./core/empty-instance.js"
import {
  buildComponentRenderer,
  renderByChartType,
  renderChart,
} from "./core/render-dispatch.js"
import * as handlers from "./handlers.js"
import { render } from "./template.js"

export { STREAM_DEFAULTS } from "./realtime/defaults.js"
export { lineChart } from "./realtime/stream-types.js"
export { withRealtime } from "./realtime/with-realtime.js"
export {
  areaChart,
  barChart,
  composedChart,
  donutChart,
  pieChart,
} from "./utils/chart-utils.js"
export { streamSlide } from "./utils/stream-slide.js"

const declarativeChildren = createDeclarativeChildren()

export const chart = {
  ...handlers,
  render,
  core: coreCharts,

  // Chart Delegators
  renderChart: renderChart(),
  renderLineChart: renderByChartType("line"),
  renderAreaChart: renderByChartType("area"),
  renderBarChart: renderByChartType("bar"),
  renderPieChart: renderByChartType("pie"),

  // Component Renderers (Abstracted)
  renderLine: buildComponentRenderer("renderLine", "line"),
  renderArea: buildComponentRenderer("renderArea", "area"),
  renderBar: buildComponentRenderer("renderBar", "bar"),
  renderPie: buildComponentRenderer("renderPie", "pie"),
  renderYAxis: buildComponentRenderer("renderYAxis"),
  renderTooltip: buildComponentRenderer("renderTooltip"),

  // Component Renderers with optional chartType override from props
  renderCartesianGrid: buildComponentRenderer(
    "renderCartesianGrid",
    null,
    true,
  ),
  renderXAxis: buildComponentRenderer("renderXAxis", null, true),
  renderBrush: buildComponentRenderer("renderBrush", null, true),

  // Declarative Helpers for Composition Style (return intention objects)
  ...declarativeChildren,

  // Helper to create bound methods (reduces repetition)
  forEntity(entityId, api) {
    const entity = api.getEntity(entityId)
    return entity ? createChartInstance(entity, api) : getEmptyChartInstance()
  },

  // Create instance for inline charts (no entityId needed)
  forEntityInline(api, tempEntity = null) {
    return createInlineChartInstance(api, tempEntity, handlers.create)
  },

  createInstance: createChartInstance,
}
