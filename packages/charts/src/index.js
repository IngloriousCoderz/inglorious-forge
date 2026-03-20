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
import {
  brushChange,
  create,
  dataUpdate,
  sizeUpdate,
} from "./handlers/chart-handlers.js"
import { STREAM_DEFAULTS } from "./realtime/defaults.js"
import { streamSlide } from "./realtime/stream-slide.js"
import { withRealtime } from "./realtime/with-realtime.js"

function renderStoreChart(entity, api) {
  return renderFrame(createFrameFromEntity(entity, api))
}

function renderCompositionChart(source, options, api) {
  const args = normalizeRenderArgs(source, options, api)
  return renderFrame(createFrameFromRender(args.source, args.config, args.api))
}

function normalizeRenderArgs(source, config, api) {
  if (isApi(config)) {
    return {
      source,
      config: {},
      api: config,
    }
  }

  return {
    source,
    config: config || {},
    api,
  }
}

function isApi(value) {
  if (!value || typeof value !== "object") return false
  return (
    typeof value.getEntity === "function" && typeof value.getType === "function"
  )
}

const baseChartType = {
  create,
  dataUpdate,
  sizeUpdate,
  brushChange,
}

function createChartType() {
  return {
    ...baseChartType,
    render(entity, api) {
      return renderStoreChart(entity, api)
    },
  }
}

const definitions = {
  lineChart: [createChartType(), withRealtime],
  areaChart: createChartType(),
  barChart: createChartType(),
  composedChart: createChartType(),
  pieChart: createChartType(),
  donutChart: createChartType(),
}

export const {
  lineChart,
  areaChart,
  barChart,
  composedChart,
  pieChart,
  donutChart,
} = definitions

export const chart = {
  create,
  dataUpdate,
  sizeUpdate,
  brushChange,
  render(source, options, api) {
    return renderCompositionChart(source, options, api)
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

export { STREAM_DEFAULTS, streamSlide, withRealtime }
