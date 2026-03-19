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
  const { sourceValue, configValue } = normalizeRenderArgs(source, options, api)
  return renderFrame(createFrameFromRender(sourceValue, configValue, api))
}

function normalizeRenderArgs(source, configOrApi, maybeApi) {
  if (isApiLike(configOrApi) && maybeApi === undefined) {
    return {
      sourceValue: source,
      configValue: {},
    }
  }

  return {
    sourceValue: source,
    configValue: configOrApi || {},
  }
}

function isApiLike(value) {
  return (
    value != null &&
    typeof value.getEntity === "function" &&
    typeof value.getType === "function"
  )
}

const baseChartType = {
  create,
  dataUpdate,
  sizeUpdate,
  brushChange,
}

const baseLineChartType = {
  ...baseChartType,
  render(entity, api) {
    return renderStoreChart(entity, api)
  },
}

export const lineChart = withRealtime(baseLineChartType)

export const areaChart = {
  ...baseChartType,
  render(entity, api) {
    return renderStoreChart(entity, api)
  },
}

export const barChart = {
  ...baseChartType,
  render(entity, api) {
    return renderStoreChart(entity, api)
  },
}

export const composedChart = {
  ...baseChartType,
  render(entity, api) {
    return renderStoreChart(entity, api)
  },
}

export const pieChart = {
  ...baseChartType,
  render(entity, api) {
    return renderStoreChart(entity, api)
  },
}

export const donutChart = {
  ...baseChartType,
  render(entity, api) {
    return renderStoreChart(entity, api)
  },
}

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
