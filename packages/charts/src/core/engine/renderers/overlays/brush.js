/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { line as createLinePath } from "d3-shape"

import { brushChange } from "../../../../handlers/chart-handlers.js"
import { maximumValue, minimumValue } from "../cartesian/shared.js"

const DEFAULT_BRUSH_HEIGHT = 30
const MIN_SELECTION_WIDTH = 12
const LEFT_ACTION = "resize-left"
const RIGHT_ACTION = "resize-right"
const PAN_ACTION = "pan"

export function renderBrush(component, frame) {
  const layout = getBrushLayout(component, frame)
  if (!layout) return svg``

  const onPan = createBrushMouseDownHandler(frame, layout, PAN_ACTION)
  const onResizeLeft = createBrushMouseDownHandler(frame, layout, LEFT_ACTION)
  const onResizeRight = createBrushMouseDownHandler(frame, layout, RIGHT_ACTION)

  return svg`
    <g class="iw-chart-brush">
      <rect
        x=${layout.brushAreaX}
        y=${layout.brushY}
        width=${layout.brushAreaWidth}
        height=${layout.brushHeight}
        fill="#f8fafc"
        stroke="#cbd5e1"
      />
      <path
        d=${layout.previewPath(layout.previewPoints) || ""}
        fill="none"
        stroke="#94a3b8"
        stroke-width="1.5"
      />
      <rect
        x=${layout.selectionX}
        y=${layout.brushY}
        width=${layout.selectionWidth}
        height=${layout.brushHeight}
        fill="rgba(59, 130, 246, 0.16)"
        stroke="#3b82f6"
        style="cursor: move;"
        @mousedown=${onPan}
      />
      <rect
        x=${layout.selectionX - 4}
        y=${layout.brushY}
        width="8"
        height=${layout.brushHeight}
        fill="#3b82f6"
        stroke="#ffffff"
        style="cursor: ew-resize;"
        @mousedown=${onResizeLeft}
      />
      <rect
        x=${layout.selectionX + layout.selectionWidth - 4}
        y=${layout.brushY}
        width="8"
        height=${layout.brushHeight}
        fill="#3b82f6"
        stroke="#ffffff"
        style="cursor: ew-resize;"
        @mousedown=${onResizeRight}
      />
    </g>
  `
}

export function getBrushRangeAfterDrag({
  startIndex,
  endIndex,
  action,
  deltaX,
  brushAreaWidth,
  dataLength,
}) {
  const totalIndices = Math.max(0, dataLength - 1)
  const selectionSize = endIndex - startIndex
  const indexDelta =
    brushAreaWidth > 0
      ? Math.round((deltaX / brushAreaWidth) * totalIndices)
      : 0

  if (action === PAN_ACTION) {
    let nextStart = startIndex + indexDelta
    let nextEnd = endIndex + indexDelta

    if (nextStart < 0) {
      nextStart = 0
      nextEnd = selectionSize
    }

    if (nextEnd > totalIndices) {
      nextEnd = totalIndices
      nextStart = Math.max(0, totalIndices - selectionSize)
    }

    return {
      startIndex: nextStart,
      endIndex: nextEnd,
    }
  }

  if (action === LEFT_ACTION) {
    let nextStart = startIndex + indexDelta

    if (nextStart < 0) {
      nextStart = 0
    } else if (nextStart >= endIndex) {
      nextStart = Math.max(0, endIndex - 1)
    }

    return {
      startIndex: nextStart,
      endIndex,
    }
  }

  let nextEnd = endIndex + indexDelta

  if (nextEnd > totalIndices) {
    nextEnd = totalIndices
  } else if (nextEnd <= startIndex) {
    nextEnd = Math.min(totalIndices, startIndex + 1)
  }

  return {
    startIndex,
    endIndex: nextEnd,
  }
}

function getBrushLayout(component, frame) {
  const { entity, dimensions } = frame
  if (
    !entity.brush?.enabled ||
    entity.brush?.visible === false ||
    !Array.isArray(entity.fullData)
  ) {
    return null
  }

  const dataKey =
    component.props?.dataKey ||
    frame.scales.plottedKeys?.[0] ||
    entity.seriesKeys?.[0]

  if (!dataKey) return null

  const brushAreaWidth = dimensions.plotWidth
  const brushAreaX = dimensions.plotLeft
  const brushHeight =
    component.props?.height || entity.brush.height || DEFAULT_BRUSH_HEIGHT
  const brushY = dimensions.brushTop
  const xStep =
    entity.fullData.length > 1
      ? brushAreaWidth / (entity.fullData.length - 1)
      : brushAreaWidth
  const previewMin = minimumValue(entity.fullData, dataKey)
  const previewMax = maximumValue(entity.fullData, dataKey)
  const previewRange = previewMax - previewMin || 1
  const previewPath = createLinePath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y((point) => point.y)
  const previewPoints = entity.fullData.map((row, index) => ({
    x: brushAreaX + xStep * index,
    y:
      brushY +
      brushHeight -
      (((row?.[dataKey] ?? 0) - previewMin) / previewRange) * brushHeight,
  }))
  const startRatio =
    entity.fullData.length > 1
      ? entity.brush.startIndex / (entity.fullData.length - 1)
      : 0
  const endRatio =
    entity.fullData.length > 1
      ? entity.brush.endIndex / (entity.fullData.length - 1)
      : 1
  const selectionX = brushAreaX + brushAreaWidth * startRatio
  const selectionWidth = Math.max(
    MIN_SELECTION_WIDTH,
    brushAreaWidth * (endRatio - startRatio),
  )

  return {
    brushAreaWidth,
    brushAreaX,
    brushHeight,
    brushY,
    dataKey,
    previewPath,
    previewPoints,
    selectionWidth,
    selectionX,
  }
}

function createBrushMouseDownHandler(frame, layout, action) {
  return (event) => {
    event.preventDefault()
    event.stopPropagation()

    const doc = event.view?.document || globalThis.document
    const svgElement = event.currentTarget?.closest?.("svg")

    if (!doc || !svgElement) return

    const svgRect = svgElement.getBoundingClientRect()
    const startMouseX = event.clientX - svgRect.left
    const brushEntity = getBrushEntity(frame)
    const initialStartIndex = brushEntity.brush.startIndex
    const initialEndIndex = brushEntity.brush.endIndex

    const handleMouseMove = (moveEvent) => {
      const currentMouseX = moveEvent.clientX - svgRect.left
      const nextRange = getBrushRangeAfterDrag({
        startIndex: initialStartIndex,
        endIndex: initialEndIndex,
        action,
        deltaX: currentMouseX - startMouseX,
        brushAreaWidth: layout.brushAreaWidth,
        dataLength: frame.entity.fullData.length,
      })

      if (
        nextRange.startIndex === brushEntity.brush.startIndex &&
        nextRange.endIndex === brushEntity.brush.endIndex
      ) {
        return
      }

      brushChange(brushEntity, nextRange)
      notifyBrushUpdate(frame)
    }

    const handleMouseUp = () => {
      doc.removeEventListener("mousemove", handleMouseMove)
      doc.removeEventListener("mouseup", handleMouseUp)
    }

    doc.addEventListener("mousemove", handleMouseMove)
    doc.addEventListener("mouseup", handleMouseUp)
  }
}

function notifyBrushUpdate(frame) {
  const brushEntity = getBrushEntity(frame)
  if (!frame.api?.notify || !brushEntity?.id) return
  frame.api.notify(`#${brushEntity.id}:update`)
}

function getBrushEntity(frame) {
  const candidate = frame.interactionEntity

  if (candidate && typeof candidate === "object") {
    candidate.brush ??= {}
    candidate.brush.enabled ??= true
    candidate.brush.height ??=
      frame.entity.brush?.height ?? DEFAULT_BRUSH_HEIGHT
    candidate.brush.visible ??= frame.entity.brush?.visible ?? true
    candidate.brush.startIndex ??= frame.entity.brush?.startIndex ?? 0
    candidate.brush.endIndex ??=
      frame.entity.brush?.endIndex ??
      Math.max(
        0,
        (candidate.data?.length || frame.entity.fullData?.length || 1) - 1,
      )
    return candidate
  }

  frame.entity.brush ??= {}
  frame.entity.brush.enabled ??= true
  frame.entity.brush.height ??= DEFAULT_BRUSH_HEIGHT
  return frame.entity
}
