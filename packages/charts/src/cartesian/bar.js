/* eslint-disable no-magic-numbers */
import { html, svg } from "@inglorious/web"
import { extent } from "d3-array"
import { scaleBand } from "d3-scale"

import { createBrushComponent } from "../component/brush.js"
import { renderGrid } from "../component/grid.js"
import { createTooltipComponent, renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { renderRectangle } from "../shape/rectangle.js"
import { renderCartesianLayout } from "../utils/cartesian-layout.js"
import { calculatePadding } from "../utils/padding.js"
import { processDeclarativeChild } from "../utils/process-declarative-child.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

export const bar = {
  /**
   * Config-based rendering entry point.
   * Builds default composition children from entity options and delegates to
   * `renderBarChart`.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  render(entity, api) {
    const type = api.getType(entity.type)
    const children = [
      entity.showGrid !== false
        ? type.renderCartesianGrid(entity, {}, api)
        : null,
      type.renderXAxis(entity, {}, api),
      type.renderYAxis(entity, {}, api),
      type.renderBar(
        entity,
        { config: { dataKey: "value", multiColor: false } },
        api,
      ),
    ].filter(Boolean)

    const chartContent = type.renderBarChart(
      entity,
      {
        children,
        config: {
          width: entity.width,
          height: entity.height,
          isRawSVG: true,
        },
      },
      api,
    )

    return renderCartesianLayout(
      entity,
      {
        chartType: "bar",
        chartContent,
        showLegend: false,
      },
      api,
    )
  },

  /**
   * Composition rendering entry point for bar charts.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ children: any[]|any, config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {import('lit-html').TemplateResult}
   */
  renderBarChart(entity, { children, config = {} }, api) {
    if (!entity) return html`<div>Entity not found</div>`
    if (!entity.data || !Array.isArray(entity.data)) {
      return html`<div>Entity data is missing or invalid</div>`
    }

    const width = config.width || entity.width || 800
    const height = config.height || entity.height || 400
    const padding = calculatePadding(width, height)

    const childrenArray = (
      Array.isArray(children) ? children : [children]
    ).filter(Boolean)

    const processedChildrenArray = childrenArray
      .map((child) => processDeclarativeChild(child, entity, "bar", api))
      .filter(Boolean)

    // Separate components using stable flags (survives minification)
    // This ensures correct Z-index ordering: Grid -> Bars -> Axes
    const grid = []
    const axes = []
    const bars = []
    const tooltip = []
    const others = []

    for (const child of processedChildrenArray) {
      // Use stable flags instead of string matching (survives minification)
      if (typeof child === "function") {
        // If it's already marked, add to the correct bucket
        if (child.isGrid) {
          grid.push(child)
        } else if (child.isAxis) {
          axes.push(child)
        } else if (child.isBar) {
          bars.push(child)
        } else if (child.isTooltip) {
          tooltip.push(child)
        } else {
          // It's a lazy function from index.js - we'll identify its type during processing
          // For now, add to others - it will be processed correctly in the final loop
          others.push(child)
        }
      } else {
        others.push(child)
      }
    }

    // Store barComponents for Y-axis calculation
    const barComponents = bars

    // 2. FUNDAMENTAL SCALE - Crucial for alignment
    const categories = entity.data.map(
      (d) => d.label || d.name || d.category || "",
    )
    const xScale = scaleBand()
      .domain(categories)
      .range([padding.left, width - padding.right])
      .padding(0.1)

    const context = createCartesianContext(
      { ...entity, width, height, padding },
      "bar",
    )
    context.xScale = xScale
    context.dimensions = { width, height, padding }
    context.chartType = "bar" // Include chartType for lazy components

    // 3. Identify data keys for Y-axis
    const dataKeys =
      config.dataKeys || barComponents.map((c) => c.dataKey || "value")

    const allValues = entity.data.flatMap((d) =>
      dataKeys.map((k) => d[k]).filter((v) => typeof v === "number"),
    )
    if (allValues.length > 0) {
      const [minVal, maxVal] = extent(allValues)
      context.yScale.domain([Math.min(0, minVal), maxVal]).nice()
    }

    // 4. Process children from 'others' to identify their real types (lazy functions from index.js)
    // This ensures grid/axes from index.js are placed in the correct buckets
    const identifiedGrid = []
    const identifiedAxes = []
    const remainingOthers = []

    for (const child of others) {
      if (typeof child === "function") {
        try {
          const result = child(context)
          if (typeof result === "function") {
            if (result.isGrid) {
              identifiedGrid.push(child) // Keep the original lazy function
            } else if (result.isAxis) {
              identifiedAxes.push(child)
            } else {
              remainingOthers.push(child)
            }
          } else {
            remainingOthers.push(child)
          }
        } catch {
          remainingOthers.push(child)
        }
      } else {
        remainingOthers.push(child)
      }
    }

    // Reorder children for correct Z-index: Grid -> Bars -> Axes -> Tooltip -> Others
    // This ensures grid is behind, bars are in the middle, and axes are on top
    const childrenToProcess = [
      ...grid,
      ...identifiedGrid, // Grids identified from others
      ...bars,
      ...axes,
      ...identifiedAxes, // Axes identified from others
      ...tooltip,
      ...remainingOthers,
    ]

    // Process children to handle lazy functions (like renderCartesianGrid from index.js)
    // Flow:
    // 1. renderCartesianGrid/renderXAxis from index.js return (ctx) => { return chartType.renderCartesianGrid(...) }
    // 2. chartType.renderCartesianGrid (from bar.js) returns gridFn which is (ctx) => { return svg... }
    // 3. So we need: child(context) -> gridFn, then gridFn(context) -> svg
    // Simplified deterministic approach: all functions from index.js return (ctx) => ..., so we can safely call with context
    const processedChildren = childrenToProcess.map((child) => {
      // Non-function children are passed through as-is
      if (typeof child !== "function") {
        return child
      }

      // If it's a marked component (isGrid, isBar, isAxis, etc), it expects context directly
      if (child.isGrid || child.isAxis || child.isBar || child.isTooltip) {
        // For bars, also pass barIndex and totalBars
        if (child.isBar) {
          const barIndex = barComponents.indexOf(child)
          return child(context, barIndex, barComponents.length)
        }
        return child(context)
      }

      // If it's a function from index.js (renderCartesianGrid, etc),
      // it returns another function that also expects context
      const result = child(context)
      // If the result is a function (marked component), call it with context
      if (typeof result === "function") {
        // For bars, also pass barIndex and totalBars
        if (result.isBar) {
          const barIndex = barComponents.indexOf(result)
          return result(context, barIndex, barComponents.length)
        }
        return result(context)
      }
      // Otherwise, return the result directly (already SVG or TemplateResult)
      return result
    })

    const svgContent = svg`
      <svg width=${width} height=${height} viewBox="0 0 ${width} ${height}">
        ${processedChildren}
      </svg>
    `

    if (config.isRawSVG) return svgContent

    return html`
      <div
        class="iw-chart"
        style="display: block; position: relative; width: 100%; box-sizing: border-box;"
      >
        ${svgContent} ${renderTooltip(entity, {}, api)}
      </div>
    `
  },

  /**
   * Composition sub-render for bars.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>, barIndex: number, totalBars: number) => import('lit-html').TemplateResult}
   */
  renderBar(entity, { config = {} }, api) {
    // Preserve config values in closure
    const { dataKey = "value", fill, multiColor = false } = config
    const drawFn = (ctx, barIndex, totalBars) => {
      const entityFromContext = ctx.entity || entity
      if (!entityFromContext) return svg``
      const entityColors = entityFromContext.colors || [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff7300",
      ]
      const { xScale, yScale, dimensions } = ctx

      // When there's only one bar, center it in the band without using subScale
      let barWidth, xOffset
      if (totalBars === 1) {
        // Single bar: occupies 80% of the band and is centered
        const bandwidth = xScale.bandwidth()
        barWidth = bandwidth * 0.8
        xOffset = (bandwidth - barWidth) / 2 // Center
      } else {
        // Multiple bars: use subScale to group them
        const subScale = scaleBand()
          .domain(Array.from({ length: totalBars }, (_, i) => i))
          .range([0, xScale.bandwidth()])
          .padding(0.1)
        barWidth = subScale.bandwidth()
        xOffset = subScale(barIndex)
      }

      return svg`
        ${entityFromContext.data.map((d, i) => {
          const category = d.label || d.name || d.category || String(i)
          const value = d[dataKey] ?? 0
          const bandStart = xScale(category)

          // Skip if bandStart is undefined or NaN (invalid category)
          if (bandStart == null || isNaN(bandStart)) {
            return svg``
          }

          const x = bandStart + xOffset
          const y = yScale(value)

          // Calculate bar height: distance from top (y) to bottom of chart area
          const chartBottom = dimensions.height - dimensions.padding.bottom
          const barHeight = Math.max(0, chartBottom - y)

          // Skip if bar has no height or invalid dimensions
          if (barHeight <= 0 || isNaN(barHeight) || isNaN(x) || isNaN(y)) {
            return svg``
          }

          const color = multiColor
            ? d.color || entityColors[i % entityColors.length]
            : fill || d.color || entityColors[barIndex % entityColors.length]

          const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
            entity: entityFromContext,
            api,
            tooltipData: { label: category, value, color },
          })
          return renderRectangle({
            x,
            y,
            width: barWidth,
            height: barHeight,
            fill: color,
            onMouseEnter,
            onMouseLeave,
          })
        })}
      `
    }

    drawFn.isBar = true
    drawFn.dataKey = config.dataKey || "value"
    return drawFn
  },

  /**
   * Composition sub-render for X axis.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderXAxis(entity, { config = {} }, api) {
    // Return a function that preserves the original object
    // This prevents lit-html from evaluating the function before passing it
    const renderFn = (ctx) => {
      const entityFromContext = ctx.entity || entity
      if (!entityFromContext) return svg``
      return renderXAxis(
        entityFromContext,
        {
          xScale: ctx.xScale,
          yScale: ctx.yScale,
          padding: ctx.dimensions.padding,
          width: ctx.dimensions.width,
          height: ctx.dimensions.height,
        },
        api,
      )
    }
    // Mark as axis component for stable identification (consistent with area.js)
    renderFn.isAxis = true
    renderFn.config = config
    renderFn.api = api
    // Add a special property to prevent lit-html from rendering directly
    // This makes the function be treated as a lit-html "directive"
    Object.defineProperty(renderFn, "_$litType$", {
      value: undefined,
      writable: false,
      enumerable: false,
      configurable: false,
    })
    // Return the marked function
    return renderFn
  },

  /**
   * Composition sub-render for Y axis.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderYAxis(entity, props, api) {
    const axisFn = (ctx) => {
      const entityFromContext = ctx.entity || entity
      return renderYAxis(
        entityFromContext,
        {
          yScale: ctx.yScale,
          ...ctx.dimensions,
          customTicks: ctx.yScale.ticks
            ? ctx.yScale.ticks(5)
            : ctx.yScale.domain(),
        },
        api,
      )
    }
    // Mark as axis component for stable identification (consistent with area.js)
    axisFn.isAxis = true
    return axisFn
  },

  /**
   * Composition sub-render for cartesian grid.
   * @param {import('../types/charts').ChartEntity} entity
   * @param {{ config?: Record<string, any> }} params
   * @param {import('@inglorious/web').Api} api
   * @returns {(ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderCartesianGrid(entity, { config = {} }, api) {
    const gridFn = (ctx) => {
      const entityFromContext = ctx.entity || entity
      if (!entityFromContext) return svg``
      return renderGrid(
        entityFromContext,
        {
          ...ctx.dimensions,
          xScale: ctx.xScale,
          yScale: ctx.yScale,
          stroke: config.stroke || "#eee",
          strokeDasharray: config.strokeDasharray || "5 5",
        },
        api,
      )
    }
    // Mark as grid component for stable identification (consistent with area.js)
    gridFn.isGrid = true
    return gridFn
  },

  /**
   * Composition sub-render for tooltip overlay.
   * @type {(entity: import('../types/charts').ChartEntity, params: { config?: Record<string, any> }, api: import('@inglorious/web').Api) => (ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderTooltip: createTooltipComponent(),

  /**
   * Composition sub-render for brush control.
   * @type {(entity: import('../types/charts').ChartEntity, params: { config?: Record<string, any> }, api: import('@inglorious/web').Api) => (ctx: Record<string, any>) => import('lit-html').TemplateResult}
   */
  renderBrush: createBrushComponent(),
}
