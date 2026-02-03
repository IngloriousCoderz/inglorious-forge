/* eslint-disable no-magic-numbers */
import { svg } from "@inglorious/web"

import { isValidNumber } from "../utils/data-utils.js"
import { createTimeScale, createXScale } from "../utils/scales.js"

/**
 * Brush Component - allows zooming and panning on cartesian charts
 * Similar to Recharts Brush component
 *
 * @param {any} entity - Chart entity
 * @param {Object} props
 * @param {import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime|import('d3-scale').ScaleBand} props.xScale - X scale
 * @param {number} props.width - Chart width
 * @param {number} props.height - Chart height
 * @param {Object} props.padding - Chart padding
 * @param {number} [props.height=30] - Brush height (default 30)
 * @param {string} [props.dataKey] - Data key for X axis
 * @param {any} api - Web API instance
 * @returns {import('lit-html').TemplateResult}
 */
export function renderBrush(entity, props, api) {
  const { xScale, width, height, padding, brushHeight = 30, dataKey } = props

  // Initialize brush state if not exists
  if (!entity.brush) {
    entity.brush = {
      startIndex: 0,
      endIndex: entity.data ? entity.data.length - 1 : 0,
      enabled: true,
    }
  }

  if (!entity.brush.enabled || !entity.data || entity.data.length === 0) {
    return svg``
  }

  // IMPORTANT: Brush uses ORIGINAL data (not filtered) for positioning
  // The brush shows the full range, but the main chart shows filtered data
  const brushData = entity.data // Always use original data
  const brushStartIndex = entity.brush.startIndex ?? 0
  const brushEndIndex = entity.brush.endIndex ?? brushData.length - 1

  const xAxisLabelBottom = height - padding.bottom + 20 + 5
  const brushY = xAxisLabelBottom
  const brushAreaHeight = brushHeight
  const brushAreaWidth = width - padding.left - padding.right
  const brushAreaX = padding.left

  // Create a scale for the brush based on ORIGINAL data
  // This scale is used to position the brush handles correctly
  // The main chart uses filtered data, but the brush needs to show the full range
  let brushXScale = xScale
  if (!xScale.bandwidth) {
    // For linear/time scales, create a new scale based on original data
    // This ensures the brush shows the full data range, not just the filtered range
    // Check if data has dates for time scale
    const hasDates = brushData.some((d) => d.date || d.x instanceof Date)
    if (hasDates) {
      brushXScale = createTimeScale(brushData, width, padding)
    } else {
      brushXScale = createXScale(brushData, width, padding)
    }
  }

  // Calculate positions for start and end handles using brush scale
  const getXPosition = (index) => {
    if (brushXScale.bandwidth) {
      // For band scales, use the category
      const category =
        brushData[index]?.[dataKey] ||
        brushData[index]?.name ||
        brushData[index]?.label ||
        String(index)
      return brushXScale(category) + brushXScale.bandwidth() / 2
    }
    // For linear/time scales, use the value directly
    const value = brushData[index]?.x ?? brushData[index]?.date ?? index
    return brushXScale(value)
  }

  const startX = getXPosition(brushStartIndex)
  const endX = getXPosition(brushEndIndex)

  // Ensure valid positions
  if (
    !isValidNumber(startX) ||
    !isValidNumber(endX) ||
    startX < brushAreaX ||
    endX > brushAreaX + brushAreaWidth
  ) {
    return svg``
  }

  const brushWidth = Math.max(20, endX - startX)

  // Create handlers for brush interactions
  const handleMouseDown = (e, action) => {
    e.preventDefault()
    e.stopPropagation()

    const svgElement = e.currentTarget.closest("svg")
    if (!svgElement) return

    const svgRect = svgElement.getBoundingClientRect()
    const startMouseX = e.clientX - svgRect.left
    const startBrushX = startX
    const startBrushEndX = endX
    const startBrushStartIndex = brushStartIndex
    const startBrushEndIndex = brushEndIndex

    const handleMouseMove = (moveEvent) => {
      // Recalculate svgRect in case of scrolling/resizing
      const currentSvgRect = svgElement.getBoundingClientRect()
      // Mouse position relative to SVG
      const currentMouseX = moveEvent.clientX - currentSvgRect.left
      // Calculate delta in brush area coordinates (startMouseX is already in SVG coordinates)
      const deltaX = currentMouseX - startMouseX

      if (action === "resize-left") {
        // Resize left handle - newX is in brush area coordinates
        const newX = Math.max(
          brushAreaX,
          Math.min(startBrushX + deltaX, startBrushEndX - 20),
        )
        const newIndex = findClosestIndex(newX, brushData, brushXScale, dataKey)
        if (newIndex >= 0 && newIndex < startBrushEndIndex) {
          entity.brush.startIndex = newIndex
          api.notify(`#${entity.id}:update`)
        }
      } else if (action === "resize-right") {
        // Resize right handle - newX is in brush area coordinates
        const newX = Math.min(
          brushAreaX + brushAreaWidth,
          Math.max(startBrushEndX + deltaX, startBrushX + 20),
        )
        const newIndex = findClosestIndex(newX, brushData, brushXScale, dataKey)
        if (newIndex > startBrushStartIndex && newIndex < brushData.length) {
          entity.brush.endIndex = newIndex
          api.notify(`#${entity.id}:update`)
        }
      } else if (action === "pan") {
        // 1. Calculate movement in indices based on pixel delta
        // Use Math.max(1, ...) to avoid division by zero
        const pixelsPerIndex = brushAreaWidth / Math.max(1, brushData.length - 1)
        const indexDelta = Math.round(deltaX / pixelsPerIndex)
        
        // 2. Calculate candidate new indices
        let nextStart = startBrushStartIndex + indexDelta
        let nextEnd = startBrushEndIndex + indexDelta

        // 3. Safety constraints
        // If hitting the left edge (0)
        if (nextStart < 0) {
          nextEnd = nextEnd - nextStart // maintain original size
          nextStart = 0
        }
        
        // If hitting the right edge (max)
        if (nextEnd >= brushData.length) {
          nextStart = nextStart - (nextEnd - (brushData.length - 1))
          nextEnd = brushData.length - 1
        }

        // 4. Ensure indices are valid and there was a change
        if (
          nextStart >= 0 && 
          nextEnd < brushData.length && 
          (nextStart !== entity.brush.startIndex || nextEnd !== entity.brush.endIndex)
        ) {
          entity.brush.startIndex = nextStart
          entity.brush.endIndex = nextEnd
          api.notify(`#${entity.id}:update`)
        }
      } else if (action === "select") {
        // New selection - currentMouseX is in SVG coordinates, need to clamp to brush area
        const newStartX = Math.max(
          brushAreaX,
          Math.min(currentMouseX, startMouseX),
        )
        const newEndX = Math.min(
          brushAreaX + brushAreaWidth,
          Math.max(currentMouseX, startMouseX),
        )

        const newStartIndex = findClosestIndex(
          newStartX,
          brushData,
          brushXScale,
          dataKey,
        )
        const newEndIndex = findClosestIndex(
          newEndX,
          brushData,
          brushXScale,
          dataKey,
        )

        if (
          newStartIndex >= 0 &&
          newEndIndex < brushData.length &&
          newStartIndex < newEndIndex
        ) {
          entity.brush.startIndex = newStartIndex
          entity.brush.endIndex = newEndIndex
          api.notify(`#${entity.id}:update`)
        }
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Determine action based on mouse position
  const getAction = (mouseX) => {
    const handleWidth = 8
    const leftHandleStart = startX - handleWidth / 2
    const leftHandleEnd = startX + handleWidth / 2
    const rightHandleStart = endX - handleWidth / 2
    const rightHandleEnd = endX + handleWidth / 2

    if (mouseX >= leftHandleStart && mouseX <= leftHandleEnd) {
      return "resize-left"
    }
    if (mouseX >= rightHandleStart && mouseX <= rightHandleEnd) {
      return "resize-right"
    }
    if (mouseX >= startX && mouseX <= endX) {
      return "pan"
    }
    return "select"
  }

  const handleBrushMouseDown = (e) => {
    const svgElement = e.currentTarget.closest("svg")
    if (!svgElement) return

    const svgRect = svgElement.getBoundingClientRect()
    const mouseX = e.clientX - svgRect.left
    const action = getAction(mouseX)
    handleMouseDown(e, action)
  }

  return svg`
    <g class="iw-chart-brush" transform="translate(0, ${brushY})">
      <!-- Brush background area -->
      <rect
        x=${brushAreaX}
        y=${0}
        width=${brushAreaWidth}
        height=${brushAreaHeight}
        fill="#f5f5f5"
        stroke="#ddd"
        stroke-width="1"
        class="iw-chart-brush-background"
      />
      
      <!-- Brush selection rectangle -->
      <rect
        x=${startX}
        y=${2}
        width=${brushWidth}
        height=${brushAreaHeight - 4}
        fill="#8884d8"
        fill-opacity="0.3"
        stroke="#8884d8"
        stroke-width="1"
        class="iw-chart-brush-selection"
        @mousedown=${handleBrushMouseDown}
        style="cursor: move;"
      />
      
      <!-- Left handle -->
      <rect
        x=${startX - 4}
        y=${0}
        width=${8}
        height=${brushAreaHeight}
        fill="#8884d8"
        stroke="#fff"
        stroke-width="1"
        class="iw-chart-brush-handle iw-chart-brush-handle-left"
        @mousedown=${(e) => {
          e.stopPropagation()
          handleMouseDown(e, "resize-left")
        }}
        style="cursor: ew-resize;"
      />
      
      <!-- Right handle -->
      <rect
        x=${endX - 4}
        y=${0}
        width=${8}
        height=${brushAreaHeight}
        fill="#8884d8"
        stroke="#fff"
        stroke-width="1"
        class="iw-chart-brush-handle iw-chart-brush-handle-right"
        @mousedown=${(e) => {
          e.stopPropagation()
          handleMouseDown(e, "resize-right")
        }}
        style="cursor: ew-resize;"
      />
      
      <!-- Mini chart preview (optional - shows data preview in brush area) -->
      ${brushData.length > 0
        ? svg`
          <g class="iw-chart-brush-preview" style="pointer-events: none;">
            <path
              d="${brushData.map((d, i) => {
                const x = getXPosition(i);
                const value = d.value ?? d.y ?? 0;
                const maxValue = Math.max(...brushData.map(dd => dd.value ?? dd.y ?? 0)) || 1;
                const y = brushAreaHeight - 2 - (value / maxValue) * (brushAreaHeight - 4);
                return `M${x},${brushAreaHeight - 2} L${x},${y}`;
              }).join(' ')}"
              stroke="#8884d8"
              stroke-width="1"
              opacity="0.4"
            />
          </g>`
        : svg``
      }
    </g>
  `
}

/**
 * Finds the closest data index for a given X position
 * @param {number} x - X position in pixels
 * @param {any[]} data - Chart data
 * @param {import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime|import('d3-scale').ScaleBand} xScale - X scale
 * @param {string} [dataKey] - Data key for X axis
 * @returns {number} Closest data index
 */
function findClosestIndex(x, data, xScale, dataKey) {
  if (!data || data.length === 0) return 0

  let minDistance = Infinity
  let closestIndex = 0

  data.forEach((d, i) => {
    let dataX
    if (xScale.bandwidth) {
      const category = d[dataKey] || d.name || d.label || String(i)
      dataX = xScale(category) + xScale.bandwidth() / 2
    } else {
      const value = d.x ?? d.date ?? i
      dataX = xScale(value)
    }

    if (isValidNumber(dataX)) {
      const distance = Math.abs(x - dataX)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }
  })

  return closestIndex
}

/**
 * Creates a brush component for composition mode (Recharts-style)
 * This factory function returns a component function that can be used in chart composition
 *
 * @param {Object} [config={}] - Configuration options
 * @param {string} [config.dataKey] - Data key for X axis
 * @param {number} [config.height=30] - Brush height
 * @returns {Function} Component function that accepts (entity, props, api) and returns a composition function
 *
 * @example
 * // In line.js, area.js, bar.js:
 * import { createBrushComponent } from "../component/brush.js"
 *
 * export const line = {
 *   renderBrush: createBrushComponent(), // or createBrushComponent({ height: 40 })
 * }
 */
export function createBrushComponent(defaultConfig = {}) {
  return (entity, props, api) => {
    const brushFn = (ctx) => {
      const { xScale, dimensions, totalHeight } = ctx
      // Try fullEntity first (for line charts), then entity, then fallback to passed entity
      const entityFromContext = ctx.fullEntity || ctx.entity || entity
      // Merge defaultConfig (from factory) with props.config (from usage)
      const config = { ...defaultConfig, ...(props.config || {}) }
      const { dataKey, height: brushHeight = 30 } = config

      return renderBrush(
        entityFromContext,
        {
          xScale,
          ...dimensions,
          ...(totalHeight && { totalHeight }),
          dataKey: dataKey || entityFromContext.dataKey || "name",
          brushHeight,
        },
        api,
      )
    }
    // Mark as brush component for stable identification during processing
    brushFn.isBrush = true
    return brushFn
  }
}
