import { coreCharts } from "./core/chart-core.js"
import { createDeclarativeChildren } from "./core/declarative-children.js"
import { buildComponentRenderer, renderChart } from "./core/render-dispatch.js"
import * as handlers from "./handlers.js"

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
  core: coreCharts,

  // Chart Delegators
  // Unified Composition-mode renderer
  render: renderChart(),

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

  // Deprecated instance helpers removed: use chart.render or api.render
}
