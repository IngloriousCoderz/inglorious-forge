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
  // Composition methods - delegate to chart types
  renderLineChart(entityId, children, api, config) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    compositionChartType.set(entityId, "line")
    const lineType = api.getType("line")
    if (lineType?.renderLineChart) {
      return lineType.renderLineChart(entity, { children, config }, api)
    }
    return svg``
  },
  renderCartesianGrid(config, entityId, api) {
    // Return a lazy function to prevent lit-html from evaluating it prematurely
    // This function will be called by renderBarChart with the correct context
    return () => {
      const entity = api.getEntity(entityId)
      if (!entity) return svg``
      // Use composition chart type if available, otherwise fallback to entity type
      const chartTypeName = compositionChartType.get(entityId) || entity.type
      const chartType = api.getType(chartTypeName)
      if (chartType?.renderCartesianGrid) {
        return chartType.renderCartesianGrid(entity, { config }, api)
      }
      return svg``
    }
  },
  renderXAxis(config, entityId, api) {
    // Return a lazy function to prevent lit-html from evaluating it prematurely
    // This function will be called by renderBarChart with the correct context
    return () => {
      const entity = api.getEntity(entityId)
      if (!entity) return svg``
      // Use composition chart type if available, otherwise fallback to entity type
      const chartTypeName = compositionChartType.get(entityId) || entity.type
      const chartType = api.getType(chartTypeName)
      if (chartType?.renderXAxis) {
        return chartType.renderXAxis(entity, { config }, api)
      }
      return svg``
    }
  },
  renderYAxis(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    // Use composition chart type if available, otherwise fallback to entity type
    const chartTypeName = compositionChartType.get(entityId) || entity.type
    const chartType = api.getType(chartTypeName)
    if (chartType?.renderYAxis) {
      return chartType.renderYAxis(entity, { config }, api)
    }
    return svg``
  },
  renderLine(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const lineType = api.getType("line")
    if (lineType?.renderLine) {
      return lineType.renderLine(entity, { config }, api)
    }
    return svg``
  },
  renderAreaChart(entityId, children, api, config) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    compositionChartType.set(entityId, "area")
    const areaType = api.getType("area")
    if (areaType?.renderAreaChart) {
      return areaType.renderAreaChart(entity, { children, config }, api)
    }
    return svg``
  },
  renderArea(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const areaType = api.getType("area")
    if (areaType?.renderArea) {
      return areaType.renderArea(entity, { config }, api)
    }
    return svg``
  },
  renderBarChart(entityId, children, api, config) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    compositionChartType.set(entityId, "bar")
    const barType = api.getType("bar")
    if (barType?.renderBarChart) {
      return barType.renderBarChart(entity, { children, config }, api)
    }
    return svg``
  },
  renderBar(config, entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) return svg``
    const barType = api.getType("bar")
    if (barType?.renderBar) {
      return barType.renderBar(entity, { config }, api)
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
      return chartType.renderTooltip(entity, { config }, api)
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
      renderLegend(config) {
        const entity = api.getEntity(entityId)
        if (!entity) {
          const emptyFn = () => svg``
          return emptyFn
        }
        // Try to get chart type from compositionChartType, or fallback to entity.type
        const chartTypeName = compositionChartType.get(entityId) || entity.type
        if (chartTypeName) {
          const chartType = api.getType(chartTypeName)
          if (chartType?.renderLegend) {
            // Return the legend function directly - it already has isLegend = true
            const legendFn = chartType.renderLegend(entity, { config }, api)
            // Ensure the mark is preserved
            if (legendFn && typeof legendFn === "function") {
              legendFn.isLegend = true
            }
            return legendFn
          }
        }
        const emptyFn = () => svg``
        return emptyFn
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
      renderDots(config) {
        const entity = api.getEntity(entityId)
        if (!entity) return () => svg``
        // Return a function that will be called by renderLineChart/renderAreaChart
        // to get the actual lazy function that receives context
        return () => {
          // Check compositionChartType when this function is called (after renderLineChart sets it)
          const chartTypeName = compositionChartType.get(entityId)
          if (chartTypeName) {
            const chartType = api.getType(chartTypeName)
            if (chartType?.renderDots) {
              return chartType.renderDots(entity, { config }, api)
            }
          }
          // Return empty function if chart type doesn't support dots
          return () => svg``
        }
      },
      renderTooltip(config) {
        return charts.renderTooltip(config, entityId, api)
      },
    }
  },
}
