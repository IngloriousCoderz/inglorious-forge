/* eslint-disable no-magic-numbers */

import { generateColors, getDefaultColors } from "./utils/colors.js"
import { calculatePadding } from "./utils/padding.js"

/**
 * @typedef {import('../types/charts').ChartEntity} ChartEntity
 * @typedef {import('../types/charts').ChartDataPoint} ChartDataPoint
 * @typedef {import('../types/charts').PieDataPoint} PieDataPoint
 * @typedef {import('../types/charts').ChartTooltip} ChartTooltip
 * @typedef {import('../types/charts').TooltipPosition} TooltipPosition
 */

/**
 * Initializes the chart entity with default state.
 * @param {ChartEntity} entity
 */
export function create(entity) {
  entity.width ??= 800
  entity.height ??= 400
  entity.padding ??= calculatePadding(entity.width, entity.height)
  entity.data ??= []

  if (!entity.colors) {
    const dataCount = entity.data?.length || 0
    entity.colors =
      dataCount > 5 ? generateColors(dataCount) : getDefaultColors()
  }

  entity.showLegend ??= true
  entity.showGrid ??= true
  entity.showTooltip ??= true
  entity.tooltip ??= null
  entity.tooltipX ??= 0
  entity.tooltipY ??= 0
  // labelPosition: "inside" | "outside" | "tooltip" | "auto"
  entity.labelPosition ??= "outside"
  entity.showLabel ??= true
  entity.outerPadding ??= undefined
  entity.outerRadius ??= undefined
  entity.innerRadius ??= undefined
  entity.offsetRadius ??= 20
  entity.minLabelPercentage ??= 2
  entity.labelOverflowMargin ??= 20
  entity.cx ??= undefined
  entity.cy ??= undefined
  entity.startAngle ??= undefined
  entity.endAngle ??= undefined
  entity.paddingAngle ??= undefined
  entity.minAngle ??= undefined
  entity.cornerRadius ??= undefined
  entity.dataKey ??= undefined
  entity.nameKey ??= undefined

  if (!entity.xAxisType && entity.data?.length > 0) {
    const hasDates = entity.data.some(
      (d) => d.date || (d.values && d.values.some((v) => v.date)),
    )
    entity.xAxisType = hasDates ? "time" : "linear"
  }
}

/**
 * Updates the chart data.
 * @param {ChartEntity} entity
 * @param {ChartDataPoint[] | PieDataPoint[]} data
 */
export function dataUpdate(entity, data) {
  entity.data = data

  if (entity.brush?.enabled) {
    const maxIndex = Math.max(0, (data?.length || 0) - 1)
    entity.brush.startIndex = Math.min(entity.brush.startIndex || 0, maxIndex)
    entity.brush.endIndex = Math.min(
      entity.brush.endIndex || maxIndex,
      maxIndex,
    )
  }
}

/**
 * Resizes the chart.
 * @param {ChartEntity} entity
 * @param {number} width
 * @param {number} height
 */
export function sizeUpdate(entity, width, height) {
  entity.width = width
  entity.height = height
  entity.padding = calculatePadding(width, height)
}

/**
 * Shows a tooltip at the specified position.
 * @param {ChartEntity} entity
 * @param {{ label: string; percentage?: number; value: number; color: string; x: number; y: number }} tooltipData
 */
export function tooltipShow(entity, tooltipData) {
  entity.tooltip = {
    label: tooltipData.label,
    percentage: tooltipData.percentage,
    value: tooltipData.value,
    color: tooltipData.color,
  }
  entity.tooltipX = tooltipData.x
  entity.tooltipY = tooltipData.y
}

/**
 * Hides the tooltip.
 * @param {ChartEntity} entity
 */
export function tooltipHide(entity) {
  entity.tooltip = null
}

/**
 * Moves the tooltip to a new position.
 * @param {ChartEntity} entity
 * @param {TooltipPosition} position
 */
export function tooltipMove(entity, position) {
  if (!entity.tooltip) return
  entity.tooltipX = position.x
  entity.tooltipY = position.y
}

/**
 * Handles brush change event (zoom/pan).
 * This is called automatically when brush selection changes.
 * @param {ChartEntity} entity
 * @param {{ startIndex: number; endIndex: number }} payload
 */
export function brushChange(entity, payload) {
  if (!entity.brush) entity.brush = { enabled: true }

  const { startIndex, endIndex } = payload
  const dataLength = entity.data?.length || 0

  entity.brush.startIndex = Math.max(0, Math.min(startIndex, dataLength - 1))
  entity.brush.endIndex = Math.max(
    entity.brush.startIndex,
    Math.min(endIndex, dataLength - 1),
  )

  if (entity.brush.startIndex === entity.brush.endIndex && dataLength > 1) {
    if (entity.brush.endIndex < dataLength - 1) entity.brush.endIndex++
    else if (entity.brush.startIndex > 0) entity.brush.startIndex--
  }
}
