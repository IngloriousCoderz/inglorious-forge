/* eslint-disable no-magic-numbers */
import { svg } from "@inglorious/web"

import { isValidNumber } from "../utils/data-utils.js"
import { createXScale } from "../utils/scales.js"

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
  // Note: xScale from props is not used - we create our own brushXScale
  // to ensure it always represents the full unfiltered data
  const { width, height, padding, brushHeight = 30 } = props

  // CRITICAL: Use original entity data for brush calculations
  // In Config mode, entity may have filtered data, but brush needs original data
  // The createBrushComponent already passes ctx.fullEntity which has original data
  // But we need to ensure entity.brush is on the correct entity (the one with original data)
  // For brush state management, we need to use the entity that has the brush state
  // This is typically the original entity, not the filtered one

  // Initialize state: ensures we have a valid selection range on first render
  if (!entity.brush) {
    entity.brush = {
      startIndex: 0,
      endIndex: entity.data ? entity.data.length - 1 : 0,
      enabled: true,
    }
  }

  // Ensure brush.enabled is true if brush exists
  if (entity.brush && entity.brush.enabled === undefined) {
    entity.brush.enabled = true
  }

  // Ensure startIndex and endIndex are defined
  if (
    entity.brush.startIndex === undefined ||
    entity.brush.endIndex === undefined
  ) {
    entity.brush.startIndex = 0
    entity.brush.endIndex = entity.data ? entity.data.length - 1 : 0
  }

  if (!entity.brush.enabled || !entity.data || entity.data.length === 0) {
    return svg``
  }

  // Use entity.data directly - this should be original data from ctx.fullEntity
  const brushData = entity.data
  const brushAreaWidth = width - padding.left - padding.right
  const brushAreaX = padding.left

  // Refined positioning: ensure it stays below the main chart area
  // Position brush at the bottom of the SVG, just below the main chart
  // The main chart ends at `height`, so brush should start right after it
  // Use height (chart height) as the base, not totalHeight
  const brushY = height

  // CRITICAL: Create a "clean" fixed scale for the Brush based on TOTAL data
  // The xScale from props may have a filtered domain (zoom applied)
  // The Brush always needs a scale that represents the full unfiltered data
  // This prevents the Brush from "jumping" when the chart is zoomed
  // Always use index-based scale for brush (simpler and more reliable)
  const brushXScale = createXScale(brushData, width, padding)
  // IMPORTANT: Force domain to always be the full index range [0, length-1]
  // This ensures the Brush scale is completely independent of the chart's zoom
  brushXScale.domain([0, brushData.length - 1])

  /** Maps data index to pixel X coordinate */
  // Simplified: since brushXScale.domain is always [0, length-1], we can directly use the index
  const getXPosition = (index) => {
    const safeIndex = Math.max(0, Math.min(index, brushData.length - 1))
    // brushXScale is always linear with domain [0, length-1], so we can use index directly
    return brushXScale(safeIndex)
  }

  const startX = getXPosition(entity.brush.startIndex)
  const endX = getXPosition(entity.brush.endIndex)

  if (!isValidNumber(startX) || !isValidNumber(endX)) {
    return svg``
  }

  // Visual width of the selection area
  const brushWidth = endX - startX

  const handleMouseDown = (e, action) => {
    e.preventDefault()
    e.stopPropagation()

    const svgElement = e.currentTarget.closest("svg")
    if (!svgElement) return

    const svgRect = svgElement.getBoundingClientRect()
    const startMouseX = e.clientX - svgRect.left

    // Snapshots: Capture current state at the start of interaction to prevent "drifting"
    const initialStartIndex = entity.brush.startIndex
    const initialEndIndex = entity.brush.endIndex
    const selectionSize = initialEndIndex - initialStartIndex
    const totalIndices = brushData.length - 1

    const handleMouseMove = (moveEvent) => {
      const currentMouseX = moveEvent.clientX - svgRect.left
      // Important: deltaX is the mouse movement in pixels since the start of drag
      const deltaX = currentMouseX - startMouseX

      if (action === "pan") {
        // 1. Calculate how much the mouse moved in pixels
        // 2. Transform pixel movement into "index delta" using the real proportion
        // Uses percentage of displacement relative to the total Brush area
        // This is mathematically more stable than pixelsPerIndex
        const indexDelta = Math.round((deltaX / brushAreaWidth) * totalIndices)

        let nextStart = initialStartIndex + indexDelta
        let nextEnd = initialEndIndex + indexDelta

        // 3. Clamping (lock the limits)
        if (nextStart < 0) {
          nextStart = 0
          nextEnd = selectionSize
        }
        if (nextEnd > totalIndices) {
          nextEnd = totalIndices
          nextStart = totalIndices - selectionSize
        }

        // Only notify if indices actually changed to optimize rendering
        if (
          nextStart !== entity.brush.startIndex ||
          nextEnd !== entity.brush.endIndex
        ) {
          entity.brush.startIndex = nextStart
          entity.brush.endIndex = nextEnd
          api.notify(`#${entity.id}:update`)
        }
      } else if (action === "resize-left" || action === "resize-right") {
        // For resize, we use the same proportion logic as pan
        // This avoids index "jumps" when the user clicks on the handle
        // Calculates the movement delta in indices and applies it to the initial index
        const indexDelta = Math.round((deltaX / brushAreaWidth) * totalIndices)

        if (action === "resize-left") {
          // Keep endIndex fixed and move only startIndex
          let nextStart = initialStartIndex + indexDelta

          // Clamping: cannot be less than 0 nor greater than endIndex
          if (nextStart < 0) {
            nextStart = 0
          } else if (nextStart >= initialEndIndex) {
            nextStart = initialEndIndex - 1
          }

          if (nextStart !== entity.brush.startIndex) {
            entity.brush.startIndex = nextStart
            api.notify(`#${entity.id}:update`)
          }
        } else {
          // resize-right: keep startIndex fixed and move only endIndex
          let nextEnd = initialEndIndex + indexDelta

          // Clamping: cannot be greater than totalIndices nor less than startIndex
          if (nextEnd > totalIndices) {
            nextEnd = totalIndices
          } else if (nextEnd <= initialStartIndex) {
            nextEnd = initialStartIndex + 1
          }

          if (nextEnd !== entity.brush.endIndex) {
            entity.brush.endIndex = nextEnd
            api.notify(`#${entity.id}:update`)
          }
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

  const result = svg`
    <g class="iw-chart-brush" transform="translate(0, ${brushY})">
      <rect x=${brushAreaX} y=0 width=${brushAreaWidth} height=${brushHeight} fill="#f5f5f5" stroke="#ddd" />
      
      <g class="iw-chart-brush-preview" style="pointer-events: none;">
        <path
          d="${brushData
            .map((d, i) => {
              const x = getXPosition(i)
              const value = d.value ?? d.y ?? 0
              const maxValue =
                Math.max(...brushData.map((dd) => dd.value ?? dd.y ?? 0)) || 1
              const y = brushHeight - 2 - (value / maxValue) * (brushHeight - 4)
              return `M${x},${brushHeight - 2} L${x},${y}`
            })
            .join(" ")}"
          stroke="#8884d8" stroke-width="1" opacity="0.3"
        />
      </g>

      <rect x=${startX} y=2 width=${brushWidth} height=${brushHeight - 4} fill="#8884d8" fill-opacity="0.3" stroke="#8884d8" 
            style="cursor: move;" @mousedown=${(e) => handleMouseDown(e, "pan")} />
      
      <rect x=${startX - 4} y=0 width=8 height=${brushHeight} fill="#8884d8" stroke="#fff" 
            style="cursor: ew-resize;" @mousedown=${(e) => handleMouseDown(e, "resize-left")} />
      <rect x=${endX - 4} y=0 width=8 height=${brushHeight} fill="#8884d8" stroke="#fff" 
            style="cursor: ew-resize;" @mousedown=${(e) => handleMouseDown(e, "resize-right")} />
    </g>`

  // Add identification flag to the result object
  result.isBrush = true
  return result
}

/**
 * Creates the Brush component function
 * * @param {Object} defaultConfig
 * @returns {Function}
 */
export function createBrushComponent(defaultConfig = {}) {
  return (entity, props, api) => {
    const brushFn = (ctx) => {
      const entityFromContext = ctx.fullEntity || ctx.entity || entity
      const config = { ...defaultConfig, ...(props.config || {}) }

      const result = renderBrush(
        entityFromContext,
        {
          xScale: ctx.xScale,
          ...ctx.dimensions,
          totalHeight: ctx.totalHeight,
          dataKey: config.dataKey || entityFromContext.dataKey || "name",
          brushHeight: config.height || 30,
        },
        api,
      )

      // Ensure the returned TemplateResult also carries the flag
      if (result) result.isBrush = true
      return result
    }

    // Crucial for identification in Config Style mode
    brushFn.isBrush = true
    return brushFn
  }
}
