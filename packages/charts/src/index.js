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
} from "./components/factories.js"
import { renderFrame } from "./core/engine/index.js"
import {
  createFrameFromEntity,
  createFrameFromRender,
} from "./core/standardizer/index.js"
import * as handlers from "./handlers/chart-handlers.js"
import { streamSlide, withRealtime } from "./realtime/index.js"

const storeRender = (entity, api) =>
  renderFrame(createFrameFromEntity(entity, api))

export const lineChart = [{ ...handlers, render: storeRender }, withRealtime]
export const areaChart = { ...handlers, render: storeRender }
export const barChart = { ...handlers, render: storeRender }
export const composedChart = { ...handlers, render: storeRender }
export const pieChart = { ...handlers, render: storeRender }
export const donutChart = { ...handlers, render: storeRender }

export const chart = {
  ...handlers,
  render(props, api) {
    return renderFrame(createFrameFromRender(props, api))
  },
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  Area,
  Bar,
  Pie,
  Dots,
  Tooltip,
  Legend,
  Brush,
}

export { streamSlide, withRealtime }
