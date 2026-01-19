import { svg } from "lit-html"

import { logic } from "./logic.js"
import { rendering } from "./rendering.js"

// Export charts
export {
  areaChart,
  barChart,
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
    const lineType = api.getType("line")
    if (lineType?.renderLineChart) {
      return lineType.renderLineChart(entityId, children, api, config)
    }
    return svg``
  },
  renderCartesianGrid(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const chartType = api.getType(entity.type)
    if (chartType?.renderCartesianGrid) {
      return chartType.renderCartesianGrid(config, entityId, api)
    }
    return svg``
  },
  renderXAxis(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const chartType = api.getType(entity.type)
    if (chartType?.renderXAxis) {
      return chartType.renderXAxis(config, entityId, api)
    }
    return svg``
  },
  renderYAxis(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const chartType = api.getType(entity.type)
    if (chartType?.renderYAxis) {
      return chartType.renderYAxis(config, entityId, api)
    }
    return svg``
  },
  renderLine(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const chartType = api.getType(entity.type)
    if (chartType?.renderLine) {
      return chartType.renderLine(config, entityId, api)
    }
    return svg``
  },
  // Helper to create bound methods (reduces repetition)
  forEntity(entityId, api) {
    return {
      renderLineChart(children, config) {
        return charts.renderLineChart(entityId, children, api, config)
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
    }
  },
}
