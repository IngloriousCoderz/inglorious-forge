import { svg } from "@inglorious/web"

import * as handlers from "./handlers.js"
import { render } from "./template.js"
import { extractDataKeysFromChildren } from "./utils/extract-data-keys.js"
export { createRealtimeStreamSystem } from "./systems/realtime-stream.js"
export { streamSlide } from "./utils/stream-slide.js"

// Export chart types for config style
export {
  areaChart,
  barChart,
  donutChart,
  lineChart,
  pieChart,
} from "./utils/chart-utils.js"

export const chart = {
  ...handlers,
  render,

  // Chart Delegators
  renderLineChart: createDelegator("line"),
  renderAreaChart: createDelegator("area"),
  renderBarChart: createDelegator("bar"),
  renderPieChart: createDelegator("pie"),

  // Component Renderers (Abstracted)
  renderLine: createComponentRenderer("renderLine", "line"),
  renderArea: createComponentRenderer("renderArea", "area"),
  renderBar: createComponentRenderer("renderBar", "bar"),
  renderPie: createComponentRenderer("renderPie", "pie"),
  renderYAxis: createComponentRenderer("renderYAxis"),
  renderTooltip: createComponentRenderer("renderTooltip"),

  // Lazy Renderers
  renderCartesianGrid: (entity, props, api) =>
    createLazyRenderer(entity, api, "renderCartesianGrid"),
  renderXAxis: (entity, props, api) =>
    createLazyRenderer(entity, api, "renderXAxis"),
  renderBrush: (entity, props, api) =>
    createLazyRenderer(entity, api, "renderBrush"),

  // Declarative Helpers for Composition Style (return intention objects)
  // The parent (renderLineChart, etc) processes these objects and "stamps" them with entity and api
  XAxis: (config = {}) => ({ type: "XAxis", config }),
  YAxis: (config = {}) => ({ type: "YAxis", config }),
  Line: (config = {}) => ({ type: "Line", config }),
  Area: (config = {}) => ({ type: "Area", config }),
  Bar: (config = {}) => ({ type: "Bar", config }),
  Pie: (config = {}) => ({ type: "Pie", config }),
  CartesianGrid: (config = {}) => ({ type: "CartesianGrid", config }),
  Tooltip: (config = {}) => ({ type: "Tooltip", config }),
  Brush: (config = {}) => ({ type: "Brush", config }),
  Dots: (config = {}) => ({ type: "Dots", config }),
  Legend: (config = {}) => ({ type: "Legend", config }),

  // Helper to create bound methods (reduces repetition)
  forEntity(entityId, api) {
    const entity = api.getEntity(entityId)
    return entity ? createInstance(entity, api) : getEmptyInstance()
  },

  // Create instance for inline charts (no entityId needed)
  forEntityInline(api, tempEntity = null) {
    const entity = tempEntity || {
      id: `__temp_${Date.now()}`,
      type: "line", // Default, can be overridden by config
      data: [],
    }
    // Preserve showTooltip if explicitly set in tempEntity
    const preserveShowTooltip =
      tempEntity?.showTooltip !== undefined ? tempEntity.showTooltip : undefined
    // Initialize entity manually since it doesn't go through the store's create handler
    handlers.create(entity)
    // Restore showTooltip if it was explicitly set
    if (preserveShowTooltip !== undefined) {
      entity.showTooltip = preserveShowTooltip
    }
    return createInstance(entity, api, true) // true = inline mode
  },

  createInstance,
}

function createInstance(entity, api, isInline = false) {
  let currentEntity = entity

  const createChartFactory =
    (chartType, renderMethod, forceStandard = false) =>
    (arg1 = {}, arg2 = []) => {
      const isLegacy = !forceStandard && Array.isArray(arg1)
      const config = isLegacy ? arg2 || {} : arg1
      const children = isLegacy ? arg1 : arg2

      if (isInline) {
        const resolvedData = config.data ?? currentEntity.data
        currentEntity = {
          ...currentEntity,
          type: config.type || chartType,
          ...(resolvedData ? { data: resolvedData } : null),
          width: config.width || currentEntity.width,
          height: config.height || currentEntity.height,
        }
      }

      const finalConfig = {
        ...config,
        data:
          config.data ||
          (!isInline && currentEntity.data ? currentEntity.data : undefined),
        // PieChart usually doesn't need dataKeys, but the extractor handles it
        dataKeys:
          chartType !== "pie"
            ? config.dataKeys || extractDataKeysFromChildren(children)
            : undefined,
      }

      return renderMethodOnType(
        currentEntity,
        renderMethod,
        {
          children: Array.isArray(children) ? children : [children],
          config: finalConfig,
        },
        api,
      )
    }

  // baseMethods return intention objects (don't render directly)
  // Processing happens in renderXxxChart which receives the children
  const baseMethods = {
    CartesianGrid: (cfg = {}) => ({ type: "CartesianGrid", config: cfg }),
    XAxis: (cfg = {}) => ({ type: "XAxis", config: cfg }),
    YAxis: (cfg = {}) => ({ type: "YAxis", config: cfg }),
    Tooltip: (cfg = {}) => ({ type: "Tooltip", config: cfg }),
    Brush: (cfg = {}) => ({ type: "Brush", config: cfg }),
    Line: (cfg = {}) => ({ type: "Line", config: cfg }),
    Area: (cfg = {}) => ({ type: "Area", config: cfg }),
    Bar: (cfg = {}) => ({ type: "Bar", config: cfg }),
    Pie: (cfg = {}) => ({ type: "Pie", config: cfg }),
  }

  const instance = {
    LineChart: createChartFactory("line", "renderLineChart", true),
    AreaChart: createChartFactory("area", "renderAreaChart", true),
    BarChart: createChartFactory("bar", "renderBarChart", true),
    PieChart: createChartFactory("pie", "renderPieChart", true),

    ...baseMethods,

    // Aliases for compatibility (renderX)
    renderLineChart: createChartFactory("line", "renderLineChart", false),
    renderAreaChart: createChartFactory("area", "renderAreaChart", false),
    renderBarChart: createChartFactory("bar", "renderBarChart", false),
    renderPieChart: createChartFactory("pie", "renderPieChart", false),
    renderCartesianGrid: baseMethods.CartesianGrid,
    renderXAxis: baseMethods.XAxis,
    renderYAxis: baseMethods.YAxis,
    renderLine: baseMethods.Line,
    renderArea: baseMethods.Area,
    renderBar: baseMethods.Bar,
    renderPie: baseMethods.Pie,
    renderTooltip: baseMethods.Tooltip,
    renderBrush: baseMethods.Brush,

    // Dots and Legend also return intention objects
    // Processing happens in renderXxxChart which receives the children
    renderDots: (config = {}) => ({ type: "Dots", config }),
    renderLegend: (config = {}) => ({ type: "Legend", config }),
  }

  // Synchronize PascalCase names with camelCase aliases
  instance.Dots = instance.renderDots
  instance.Legend = instance.renderLegend

  return instance
}

function createDelegator(typeKey) {
  const firstCharIndex = 0
  const restStartIndex = 1
  const firstChar = typeKey.charAt(firstCharIndex)
  const rest = typeKey.slice(restStartIndex)
  const methodName = `render${firstChar.toUpperCase() + rest}Chart`

  return function delegateToChartType(entity, params, api) {
    if (!entity) return renderEmptyTemplate()
    const chartType = api.getType(typeKey)
    return chartType?.[methodName]
      ? chartType[methodName](entity, params, api)
      : renderEmptyTemplate()
  }
}

function createLazyRenderer(entity, api, methodName) {
  return function renderLazy(ctx) {
    if (!entity) return renderEmptyTemplate()
    const chartTypeName = ctx?.chartType || entity.type
    const chartType = api.getType(chartTypeName)
    return chartType?.[methodName]
      ? chartType[methodName](entity, { config: ctx?.config || {} }, api)
      : renderEmptyTemplate()
  }
}

function createComponentRenderer(methodName, typeOverride = null) {
  return function renderComponent(entity, { config = {} }, api) {
    if (!entity) return renderEmptyTemplate()
    const type = api.getType(typeOverride || entity.type)
    return type?.[methodName]
      ? type[methodName](entity, { config }, api)
      : renderEmptyTemplate()
  }
}

function renderMethodOnType(entity, methodName, params, api) {
  const type = api.getType(entity.type)
  return type?.[methodName]
    ? type[methodName](entity, params, api)
    : renderEmptyTemplate()
}

function renderEmptyTemplate() {
  return svg``
}

function renderEmptyLazyTemplate() {
  return renderEmptyTemplate
}

function getEmptyInstance() {
  return {
    renderLineChart: renderEmptyTemplate,
    renderAreaChart: renderEmptyTemplate,
    renderBarChart: renderEmptyTemplate,
    renderPieChart: renderEmptyTemplate,
    renderCartesianGrid: renderEmptyLazyTemplate,
    renderXAxis: renderEmptyLazyTemplate,
    renderYAxis: renderEmptyTemplate,
    renderLegend: renderEmptyLazyTemplate,
    renderLine: renderEmptyTemplate,
    renderArea: renderEmptyTemplate,
    renderBar: renderEmptyTemplate,
    renderPie: renderEmptyTemplate,
    renderDots: renderEmptyLazyTemplate,
    renderTooltip: renderEmptyTemplate,
    renderBrush: renderEmptyLazyTemplate,
    // Composition Style
    LineChart: renderEmptyTemplate,
    AreaChart: renderEmptyTemplate,
    BarChart: renderEmptyTemplate,
    PieChart: renderEmptyTemplate,
    CartesianGrid: renderEmptyLazyTemplate,
    XAxis: renderEmptyLazyTemplate,
    YAxis: renderEmptyTemplate,
    Line: renderEmptyTemplate,
    Area: renderEmptyTemplate,
    Bar: renderEmptyTemplate,
    Pie: renderEmptyTemplate,
    Dots: renderEmptyLazyTemplate,
    Tooltip: renderEmptyTemplate,
    Brush: renderEmptyLazyTemplate,
    Legend: renderEmptyLazyTemplate,
  }
}
