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
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadialBar,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "./primitives/factories.js"
import { streamSlide } from "./realtime/index.js"

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
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadialBar,
  Scatter,
  streamSlide,
  Tooltip,
  XAxis,
  YAxis,
}

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
