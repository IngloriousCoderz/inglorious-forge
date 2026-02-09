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

  // Initialize state: ensures we have a valid selection range on first render
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

  const brushData = entity.data
  const brushAreaWidth = width - padding.left - padding.right
  const brushAreaX = padding.left
  const brushY = height - padding.bottom + 25

  // Scale synchronization: ensures brush uses original data range for positioning
  let brushXScale = xScale
  if (!xScale.bandwidth) {
    const hasDates = brushData.some((d) => d.date || d.x instanceof Date)
    brushXScale = hasDates
      ? createTimeScale(brushData, width, padding)
      : createXScale(brushData, width, padding)
  }

  /** Maps data index to pixel X coordinate */
  const getXPosition = (index) => {
    const safeIndex = Math.max(0, Math.min(index, brushData.length - 1))
    if (brushXScale.bandwidth) {
      const category =
        brushData[safeIndex]?.[dataKey] ||
        brushData[safeIndex]?.name ||
        String(safeIndex)
      return brushXScale(category) + brushXScale.bandwidth() / 2
    }
    const value =
      brushData[safeIndex]?.x ?? brushData[safeIndex]?.date ?? safeIndex
    return brushXScale(value)
  }

  const startX = getXPosition(entity.brush.startIndex)
  const endX = getXPosition(entity.brush.endIndex)

  if (!isValidNumber(startX) || !isValidNumber(endX)) return svg``

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
    const initialStartX = startX
    const initialEndX = endX
    const selectionSize = initialEndIndex - initialStartIndex
    const totalDataCount = brushData.length - 1

    const handleMouseMove = (moveEvent) => {
      const currentMouseX = moveEvent.clientX - svgRect.left
      const deltaX = currentMouseX - startMouseX

      // index-to-pixel ratio used for consistent panning
      const pixelsPerIndex = brushAreaWidth / Math.max(1, totalDataCount)

      if (action === "pan") {
        const indexDelta = Math.round(deltaX / pixelsPerIndex)
        let nextStart = initialStartIndex + indexDelta

        // Bounds clamping: keep selection within data limits
        if (nextStart < 0) nextStart = 0
        if (nextStart + selectionSize > totalDataCount)
          nextStart = totalDataCount - selectionSize
        let nextEnd = nextStart + selectionSize

        // Only notify if indices actually changed to optimize rendering
        if (
          nextStart !== entity.brush.startIndex ||
          nextEnd !== entity.brush.endIndex
        ) {
          entity.brush.startIndex = nextStart
          entity.brush.endIndex = nextEnd
          api.notify(`#${entity.id}:update`)
        }
      } else if (action === "resize-left") {
        const newX = Math.max(
          brushAreaX,
          Math.min(initialStartX + deltaX, initialEndX - 5),
        )
        const newIndex = findClosestIndex(newX, brushData, brushXScale, dataKey)
        if (
          newIndex !== entity.brush.startIndex &&
          newIndex < entity.brush.endIndex
        ) {
          entity.brush.startIndex = newIndex
          api.notify(`#${entity.id}:update`)
        }
      } else if (action === "resize-right") {
        const newX = Math.min(
          brushAreaX + brushAreaWidth,
          Math.max(initialEndX + deltaX, initialStartX + 5),
        )
        const newIndex = findClosestIndex(newX, brushData, brushXScale, dataKey)
        if (
          newIndex !== entity.brush.endIndex &&
          newIndex > entity.brush.startIndex
        ) {
          entity.brush.endIndex = newIndex
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

  return svg`
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
}

/** Finds the nearest data index for a given pixel coordinate */
function findClosestIndex(x, data, xScale, dataKey) {
  if (!data || data.length === 0) return 0
  let minDistance = Infinity
  let closestIndex = 0
  data.forEach((d, i) => {
    let dataX
    if (xScale.bandwidth) {
      const category = d[dataKey] || d.name || String(i)
      dataX = xScale(category) + xScale.bandwidth() / 2
    } else {
      dataX = xScale(d.x ?? d.date ?? i)
    }
    const distance = Math.abs(x - dataX)
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  })
  return closestIndex
}

export function createBrushComponent(defaultConfig = {}) {
  return (entity, props, api) => {
    const brushFn = (ctx) => {
      const entityFromContext = ctx.fullEntity || ctx.entity || entity
      const config = { ...defaultConfig, ...(props.config || {}) }
      return renderBrush(
        entityFromContext,
        {
          xScale: ctx.xScale,
          ...ctx.dimensions,
          dataKey: config.dataKey || entityFromContext.dataKey || "name",
          brushHeight: config.height || 30,
        },
        api,
      )
    }
    brushFn.isBrush = true
    return brushFn
  }
}
