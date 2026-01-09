/* eslint-disable no-magic-numbers */

import { generateColors, getDefaultColors } from "./utils/colors.js"

/**
 * Calculate padding based on chart dimensions
 * @param {number} [width=800] - Chart width
 * @param {number} [height=400] - Chart height
 * @returns {Object} Padding object with top, right, bottom, left
 */
function calculatePadding(width = 800, height = 400) {
  return {
    top: Math.max(20, height * 0.05),
    right: Math.max(20, width * 0.05),
    bottom: Math.max(40, height * 0.1),
    left: Math.max(50, width * 0.1),
  }
}

/**
 * @typedef {import('../types/charts').ChartEntity} ChartEntity
 * @typedef {import('../types/charts').ChartDataPoint} ChartDataPoint
 * @typedef {import('../types/charts').PieDataPoint} PieDataPoint
 * @typedef {import('../types/charts').ChartTooltip} ChartTooltip
 * @typedef {import('../types/charts').TooltipPosition} TooltipPosition
 */

export const logic = {
  /**
   * Initializes the chart entity with default state.
   * @param {ChartEntity} entity
   */
  create(entity) {
    initChart(entity)
  },

  /**
   * Updates the chart data.
   * @param {ChartEntity} entity
   * @param {ChartDataPoint[] | PieDataPoint[]} data
   */
  updateData(entity, data) {
    entity.data = data
  },

  /**
   * Resizes the chart.
   * @param {ChartEntity} entity
   * @param {number} width
   * @param {number} height
   */
  resize(entity, width, height) {
    entity.width = width
    entity.height = height
    entity.padding = calculatePadding(width, height)
  },

  /**
   * Shows a tooltip at the specified position.
   * @param {ChartEntity} entity
   * @param {{ label: string; percentage?: number; value: number; color: string; x: number; y: number }} tooltipData
   */
  showTooltip(entity, tooltipData) {
    entity.tooltip = {
      label: tooltipData.label,
      percentage: tooltipData.percentage,
      value: tooltipData.value,
      color: tooltipData.color,
    }
    entity.tooltipX = tooltipData.x
    entity.tooltipY = tooltipData.y
  },

  /**
   * Hides the tooltip.
   * @param {ChartEntity} entity
   */
  hideTooltip(entity) {
    entity.tooltip = null
  },

  /**
   * Moves the tooltip to a new position.
   * @param {ChartEntity} entity
   * @param {TooltipPosition} position
   */
  moveTooltip(entity, position) {
    if (!entity.tooltip) return
    entity.tooltipX = position.x
    entity.tooltipY = position.y
  },
}

// Private helper functions

/**
 * Initializes the chart entity with default state.
 * @param {ChartEntity} entity
 */
function initChart(entity) {
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
