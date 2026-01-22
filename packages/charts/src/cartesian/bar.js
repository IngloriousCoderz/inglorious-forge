/* eslint-disable no-magic-numbers */
import { extent } from "d3-array"
import { scaleBand } from "d3-scale"
import { html, svg } from "lit-html"

import { renderGrid } from "../component/grid.js"
import { renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { renderRectangle } from "../shape/rectangle.js"
import { renderCartesianLayout } from "../utils/cartesian-layout.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

function calculatePadding(width = 800, height = 400) {
  return {
    top: Math.max(20, height * 0.05),
    right: Math.max(20, width * 0.05),
    bottom: Math.max(40, height * 0.1),
    left: Math.max(50, width * 0.1),
  }
}

export const bar = {
  renderChart(entity, api) {
    // Create a minimal api adapter if not provided (for direct renderChart calls in tests)
    const chartApi = api || {
      getEntity: (id) => (id === entity.id ? entity : null),
      getType: () => null,
    }

    const children = [
      entity.showGrid !== false ? this.renderCartesianGrid({}) : null,
      this.renderXAxis({}, entity.id, chartApi),
      this.renderYAxis({}, entity.id, chartApi),
      this.renderBar(
        { dataKey: "value", multiColor: true },
        entity.id,
        chartApi,
      ),
    ].filter(Boolean)

    const chartContent = this.renderBarChart(entity.id, children, chartApi, {
      width: entity.width,
      height: entity.height,
      isRawSVG: true,
    })

    return renderCartesianLayout({
      entity,
      api: chartApi,
      chartType: "bar",
      chartContent,
      showLegend: false,
    })
  },

  renderBarChart(entityId, children, api, config = {}) {
    const entity = api?.getEntity ? api.getEntity(entityId) : null
    if (!entity) return html`<div>Entity ${entityId} not found</div>`

    const width = config.width || entity.width || 800
    const height = config.height || entity.height || 400
    const padding = calculatePadding(width, height)

    const childrenArray = (
      Array.isArray(children) ? children : [children]
    ).filter(Boolean)

    // 1. Process lazy children first to identify barComponents
    const processedChildren = []
    const barComponents = []

    for (const child of childrenArray) {
      if (typeof child === "function" && !child.isBar && !child.isXAxis) {
        // Lazy function: call to get the real component
        try {
          const lazyResult = child()
          if (typeof lazyResult === "function" && lazyResult.isBar) {
            barComponents.push(lazyResult)
            processedChildren.push(lazyResult)
          } else {
            processedChildren.push(lazyResult)
          }
        } catch {
          // If it fails, keep as is
          processedChildren.push(child)
        }
      } else {
        // Already a direct component
        if (typeof child === "function" && child.isBar) {
          barComponents.push(child)
        }
        processedChildren.push(child)
      }
    }

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

    const svgContent = svg`
      <svg width=${width} height=${height} viewBox="0 0 ${width} ${height}">
        ${processedChildren.map((child) => {
          // If it's a "lazy" function (returns the component), call it first
          // But only if it hasn't been processed yet (not isBar or isXAxis)
          if (typeof child === "function" && !child.isBar && !child.isXAxis) {
            // Try calling as lazy function first
            try {
              const lazyResult = child()
              // If it returned a marked function, process with context
              if (typeof lazyResult === "function") {
                if (lazyResult.isBar) {
                  const barIndex = barComponents.indexOf(lazyResult)
                  return lazyResult(context, barIndex, barComponents.length)
                }
                if (lazyResult.isXAxis) {
                  return lazyResult(context)
                }
                // Generic function: try with context first, if it fails, without context
                try {
                  return lazyResult(context)
                } catch {
                  // If it fails with context, try without context
                  try {
                    return lazyResult()
                  } catch {
                    // If it also fails without context, return empty
                    return svg``
                  }
                }
              }
              // If it returned an object, process as object
              child = lazyResult
            } catch {
              // If it fails, treat as normal function (may already be a function that needs context)
              // Do nothing, let it fall through to the next if
            }
          }
          // If it's an object marked as X-axis, process it
          if (child && typeof child === "object" && child.isXAxis) {
            return child.render(context)
          }
          // If it's a function, inject the context (Composition and Config-first modes)
          if (typeof child === "function") {
            if (child.isBar) {
              const barIndex = barComponents.indexOf(child)
              return child(context, barIndex, barComponents.length)
            }
            if (child.isXAxis) {
              return child(context)
            }
            return child(context)
          }
          // If it's an object (TemplateResult), render as is
          // This can happen when lit-html evaluates the function before passing it
          if (child && typeof child === "object" && child._$litType$) {
            // For now, render as is (but this won't work correctly)
            return child
          }
          // If it's a static object, render as is (but ideally it should be a function)
          return child
        })}
      </svg>
    `

    if (config.isRawSVG) return svgContent

    return html`
      <div class="iw-chart" style="position: relative;">
        ${svgContent} ${this.renderTooltip({}, entityId, api)(context)}
      </div>
    `
  },

  renderBar(config, entityId, api) {
    const drawFn = (ctx, barIndex, totalBars) => {
      const entity = api?.getEntity ? api.getEntity(entityId) : null
      if (!entity) return svg``
      const { dataKey = "value", fill, multiColor = false } = config
      const entityColors = entity.colors || [
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
        ${entity.data.map((d, i) => {
          const category = d.label || d.name || d.category || String(i)
          const value = d[dataKey] ?? 0
          const bandStart = xScale(category)
          const x = bandStart + xOffset
          const y = yScale(value)
          const barHeight = Math.max(
            0,
            dimensions.height - dimensions.padding.bottom - y,
          )
          const color = multiColor
            ? d.color || entityColors[i % entityColors.length]
            : fill || d.color || entityColors[barIndex % entityColors.length]

          const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
            entity,
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

  renderXAxis(config, entityId, api) {
    // Return a function that preserves the original object
    // This prevents lit-html from evaluating the function before passing it
    const renderFn = (ctx) => {
      const entity = api?.getEntity ? api.getEntity(entityId) : null
      if (!entity) return svg``
      // Here we ensure that renderXAxis receives the centered scale
      return renderXAxis({
        entity,
        xScale: ctx.xScale,
        yScale: ctx.yScale,
        padding: ctx.dimensions.padding,
        width: ctx.dimensions.width,
        height: ctx.dimensions.height,
      })
    }
    // Mark as X-axis function for identification
    renderFn.isXAxis = true
    renderFn.config = config
    renderFn.entityId = entityId
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

  renderYAxis() {
    return (ctx) =>
      renderYAxis({
        yScale: ctx.yScale,
        ...ctx.dimensions,
        customTicks: ctx.yScale.ticks
          ? ctx.yScale.ticks(5)
          : ctx.yScale.domain(),
      })
  },

  renderCartesianGrid(config) {
    return (ctx) =>
      renderGrid({
        ...ctx.dimensions,
        xScale: ctx.xScale,
        yScale: ctx.yScale,
        stroke: config.stroke || "#eee",
        strokeDasharray: config.strokeDasharray || "5 5",
      })
  },

  renderTooltip(_, entityId, api) {
    return () => {
      const entity = api?.getEntity ? api.getEntity(entityId) : null
      return entity ? renderTooltip(entity) : svg``
    }
  },
}
