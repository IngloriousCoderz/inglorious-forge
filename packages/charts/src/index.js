import { renderFrame } from "./core/engine/index.js"
import {
  createFrameFromEntity,
  createFrameFromRender,
} from "./core/standardizer/index.js"
import * as handlers from "./handlers/chart-handlers.js"
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  Dots,
  Legend,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "./primitives/factories.js"
import { streamSlide } from "./realtime/index.js"

function renderChart(source, api) {
  if (
    source &&
    typeof source === "object" &&
    Object.hasOwn(source, "children")
  ) {
    return renderFrame(createFrameFromRender(source, api))
  }

  return renderFrame(createFrameFromEntity(source, api))
}

// The chart type: its event handlers and render. The primitives are separate
// exports, so the store does not take them for event handlers.
export const Chart = {
  ...handlers,
  render(source, api) {
    return renderChart(source, api)
  },
}

export {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  Dots,
  Legend,
  Line,
  Pie,
  streamSlide,
  Tooltip,
  XAxis,
  YAxis,
}
