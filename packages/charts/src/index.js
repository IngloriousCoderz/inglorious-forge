import { svg } from "lit-html"

import { logic } from "./logic.js"
import { rendering } from "./rendering.js"

// Store chart type for composition methods (keyed by entityId)
// This allows renderCartesianGrid, renderXAxis, renderYAxis to know which chart type to use
const compositionChartType = new Map()

// Export charts
export {
  areaChart,
  barChart,
  chart,
  donutChart,
  lineChart,
  pieChart,
} from "./utils/chart-utils.js"

// Export main charts object
export const charts = {
  ...logic,
  ...rendering,
  // Composition methods (Recharts-style) - delegate to chart types
  renderLineChart(entityId, children, api, config) {
    compositionChartType.set(entityId, "line")
    const lineType = api.getType("line")
    if (lineType?.renderLineChart) {
      return lineType.renderLineChart(entityId, children, api, config)
    }
    return svg``
  },
  renderCartesianGrid(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    // Use composition chart type if available, otherwise fallback to entity type
    const chartTypeName = compositionChartType.get(entityId) || entity.type
    const chartType = api.getType(chartTypeName)
    if (chartType?.renderCartesianGrid) {
      return chartType.renderCartesianGrid(config, entityId, api)
    }
    return svg``
  },
  renderXAxis(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    // Use composition chart type if available, otherwise fallback to entity type
    const chartTypeName = compositionChartType.get(entityId) || entity.type
    const chartType = api.getType(chartTypeName)
    if (chartType?.renderXAxis) {
      return chartType.renderXAxis(config, entityId, api)
    }
    return svg``
  },
  renderYAxis(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    // Use composition chart type if available, otherwise fallback to entity type
    const chartTypeName = compositionChartType.get(entityId) || entity.type
    const chartType = api.getType(chartTypeName)
    if (chartType?.renderYAxis) {
      return chartType.renderYAxis(config, entityId, api)
    }
    return svg``
  },
  renderLine(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const lineType = api.getType("line")
    if (lineType?.renderLine) {
      return lineType.renderLine(config, entityId, api)
    }
    return svg``
  },
  renderAreaChart(entityId, children, api, config) {
    compositionChartType.set(entityId, "area")
    const areaType = api.getType("area")
    if (areaType?.renderAreaChart) {
      return areaType.renderAreaChart(entityId, children, api, config)
    }
    return svg``
  },
  renderArea(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const areaType = api.getType("area")
    if (areaType?.renderArea) {
      return areaType.renderArea(config, entityId, api)
    }
    return svg``
  },
  renderBarChart(entityId, children, api, config) {
    compositionChartType.set(entityId, "bar")
    const barType = api.getType("bar")
    if (barType?.renderBarChart) {
      return barType.renderBarChart(entityId, children, api, config)
    }
    return svg``
  },
  renderBar(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const barType = api.getType("bar")
    if (barType?.renderBar) {
      return barType.renderBar(config, entityId, api)
    }
    return svg``
  },
  renderTooltip(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    // Use composition chart type if available, otherwise fallback to entity type
    const chartTypeName = compositionChartType.get(entityId) || entity.type
    const chartType = api.getType(chartTypeName)
    if (chartType?.renderTooltip) {
      return chartType.renderTooltip(config, entityId, api)
    }
    return svg``
  },
  // Helper to create bound methods (reduces repetition)
  forEntity(entityId, api) {
    return {
      renderLineChart(children, config) {
        return charts.renderLineChart(entityId, children, api, config)
      },
      renderAreaChart(children, config) {
        return charts.renderAreaChart(entityId, children, api, config)
      },
      renderBarChart(children, config) {
        return charts.renderBarChart(entityId, children, api, config)
      },
      renderCartesianGrid(config) {
        return charts.renderCartesianGrid(config, entityId, api)
      },
      renderXAxis(config) {
        return charts.renderXAxis(config, entityId, api)
      },
      renderYAxis(config) {
        return charts.renderYAxis(config, entityId, api)
      },
      renderLine(config) {
        return charts.renderLine(config, entityId, api)
      },
      renderArea(config) {
        return charts.renderArea(config, entityId, api)
      },
      renderBar(config) {
        return charts.renderBar(config, entityId, api)
      },
      renderTooltip(config) {
        return charts.renderTooltip(config, entityId, api)
      },
    }
  },
}
