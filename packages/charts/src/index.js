import { svg } from "@inglorious/web"

import { logic } from "./logic.js"
import { rendering } from "./rendering.js"

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
  renderLineChart(entity, { children, config = {} }, api) {
    if (!entity) {
      return svg``
    }
    const lineType = api.getType("line")
    if (lineType?.renderLineChart) {
      return lineType.renderLineChart(entity, { children, config }, api)
    }
    return svg``
  },
  renderCartesianGrid(entity, { config = {} }, api) {
    // Return a lazy function to prevent lit-html from evaluating it prematurely
    // This function will be called by renderBarChart/renderAreaChart with the correct context
    // The context will contain chartType, so we can read it from there
    return (ctx) => {
      if (!entity) return svg``
      // Read chartType from context if available (composition mode), otherwise use entity.type
      const chartTypeName = ctx?.chartType || entity.type
      const chartType = api.getType(chartTypeName)
      if (chartType?.renderCartesianGrid) {
        return chartType.renderCartesianGrid(entity, { config }, api)
      }
      return svg``
    }
  },
  renderXAxis(entity, { config = {} }, api) {
    // Return a lazy function to prevent lit-html from evaluating it prematurely
    // This function will be called by renderBarChart/renderAreaChart with the correct context
    return (ctx) => {
      if (!entity) return svg``
      // Read chartType from context if available (composition mode), otherwise use entity.type
      const chartTypeName = ctx?.chartType || entity.type
      const chartType = api.getType(chartTypeName)
      if (chartType?.renderXAxis) {
        return chartType.renderXAxis(entity, { config }, api)
      }
      return svg``
    }
  },
  renderYAxis(entity, { config = {} }, api) {
    if (!entity) return svg``
    // For YAxis, we can't rely on context since it's not always passed
    // Use entity.type as fallback (works for config-first mode)
    const chartTypeName = entity.type
    const chartType = api.getType(chartTypeName)
    if (chartType?.renderYAxis) {
      return chartType.renderYAxis(entity, { config }, api)
    }
    return svg``
  },
  renderLine(entity, { config = {} }, api) {
    if (!entity) return svg``
    const lineType = api.getType("line")
    if (lineType?.renderLine) {
      return lineType.renderLine(entity, { config }, api)
    }
    return svg``
  },
  renderAreaChart(entity, { children, config = {} }, api) {
    if (!entity) return svg``
    const areaType = api.getType("area")
    if (areaType?.renderAreaChart) {
      return areaType.renderAreaChart(entity, { children, config }, api)
    }
    return svg``
  },
  renderArea(entity, { config = {} }, api) {
    if (!entity) return svg``
    const areaType = api.getType("area")
    if (areaType?.renderArea) {
      return areaType.renderArea(entity, { config }, api)
    }
    return svg``
  },
  renderBarChart(entity, { children, config = {} }, api) {
    if (!entity) return svg``
    const barType = api.getType("bar")
    if (barType?.renderBarChart) {
      return barType.renderBarChart(entity, { children, config }, api)
    }
    return svg``
  },
  renderBar(entity, { config = {} }, api) {
    if (!entity) return svg``
    const barType = api.getType("bar")
    if (barType?.renderBar) {
      return barType.renderBar(entity, { config }, api)
    }
    return svg``
  },
  renderTooltip(entity, { config = {} }, api) {
    if (!entity) return svg``
    // Use entity.type (works for both config-first and composition modes)
    const chartType = api.getType(entity.type)
    if (chartType?.renderTooltip) {
      return chartType.renderTooltip(entity, { config }, api)
    }
    return svg``
  },
  renderBrush(entity, { config = {} }, api) {
    // Return a lazy function to prevent lit-html from evaluating it prematurely
    // This function will be called by renderLineChart/renderAreaChart with the correct context
    return (ctx) => {
      if (!entity) return svg``
      // Read chartType from context if available (composition mode), otherwise use entity.type
      const chartTypeName = ctx?.chartType || entity.type
      const chartType = api.getType(chartTypeName)
      if (chartType?.renderBrush) {
        return chartType.renderBrush(entity, { config }, api)
      }
      return svg``
    }
  },
  renderPieChart(entity, { children, config = {} }, api) {
    if (!entity) return svg``
    const pieType = api.getType("pie")
    if (pieType?.renderPieChart) {
      return pieType.renderPieChart(entity, { children, config }, api)
    }
    return svg``
  },
  renderPie(entity, { config = {} }, api) {
    if (!entity) return svg``
    const pieType = api.getType("pie")
    if (pieType?.renderPie) {
      return pieType.renderPie(entity, { config }, api)
    }
    return svg``
  },
  // Helper to create bound methods (reduces repetition)
  // Does entity lookup once and passes entity to all methods
  forEntity(entityId, api) {
    const entity = api.getEntity(entityId)
    if (!entity) {
      // Return empty functions if entity not found
      const emptyFn = () => svg``
      return {
        renderLineChart: () => svg``,
        renderAreaChart: () => svg``,
        renderBarChart: () => svg``,
        renderPieChart: () => svg``,
        renderCartesianGrid: () => emptyFn,
        renderXAxis: () => emptyFn,
        renderYAxis: () => svg``,
        renderLegend: () => emptyFn,
        renderLine: () => svg``,
        renderArea: () => svg``,
        renderBar: () => svg``,
        renderPie: () => svg``,
        renderDots: () => emptyFn,
        renderTooltip: () => svg``,
      }
    }

    return {
      renderLineChart(children, config) {
        return charts.renderLineChart(entity, { children, config }, api)
      },
      renderAreaChart(children, config) {
        return charts.renderAreaChart(entity, { children, config }, api)
      },
      renderBarChart(children, config) {
        return charts.renderBarChart(entity, { children, config }, api)
      },
      renderPieChart(children, config) {
        return charts.renderPieChart(entity, { children, config }, api)
      },
      renderCartesianGrid(config) {
        return charts.renderCartesianGrid(entity, { config }, api)
      },
      renderXAxis(config) {
        return charts.renderXAxis(entity, { config }, api)
      },
      renderYAxis(config) {
        return charts.renderYAxis(entity, { config }, api)
      },
      renderLegend(config) {
        // Use entity.type (works for both config-first and composition modes)
        const chartType = api.getType(entity.type)
        if (chartType?.renderLegend) {
          // Return the legend function directly - it already has isLegend = true
          const legendFn = chartType.renderLegend(entity, { config }, api)
          // Ensure the mark is preserved
          if (legendFn && typeof legendFn === "function") {
            legendFn.isLegend = true
          }
          return legendFn
        }
        const emptyFn = () => svg``
        return emptyFn
      },
      renderLine(config) {
        return charts.renderLine(entity, { config }, api)
      },
      renderArea(config) {
        return charts.renderArea(entity, { config }, api)
      },
      renderBar(config) {
        return charts.renderBar(entity, { config }, api)
      },
      renderPie(config) {
        return charts.renderPie(entity, { config }, api)
      },
      renderDots(config) {
        // Return a function that will be called by renderLineChart/renderAreaChart
        // to get the actual lazy function that receives context
        return (ctx) => {
          // Read chartType from context if available (composition mode), otherwise use entity.type
          const chartTypeName = ctx?.chartType || entity.type
          const chartType = api.getType(chartTypeName)
          if (chartType?.renderDots) {
            return chartType.renderDots(entity, { config }, api)
          }
          // Return empty function if chart type doesn't support dots
          return () => svg``
        }
      },
      renderTooltip(config) {
        return charts.renderTooltip(entity, { config }, api)
      },
      renderBrush(config) {
        return charts.renderBrush(entity, { config }, api)
      },
    }
  },
}
