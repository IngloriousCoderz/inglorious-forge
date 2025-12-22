/* eslint-disable no-magic-numbers */

import { calculatePadding } from "./utils/padding.js"

export const logic = {
  init(entity) {
    entity.width ??= 800
    entity.height ??= 400
    entity.padding ??= calculatePadding(entity.width, entity.height)
    entity.data ??= []
    entity.colors ??= ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]
    entity.showLegend ??= true
    entity.showGrid ??= true
    entity.showTooltip ??= true
    entity.tooltip ??= null
    entity.tooltipX ??= 0
    entity.tooltipY ??= 0
    // labelPosition: "inside" | "outside" | "tooltip" | "auto" (default)
    entity.labelPosition ??= "auto"

    // Detecção automática de xAxisType se não fornecido
    if (!entity.xAxisType && entity.data?.length > 0) {
      const hasDates = entity.data.some(
        (d) => d.date || (d.values && d.values.some((v) => v.date)),
      )
      entity.xAxisType = hasDates ? "time" : "linear"
    }
  },

  updateData(entity, data) {
    entity.data = data
  },

  resize(entity, width, height) {
    entity.width = width
    entity.height = height
    entity.padding = calculatePadding(width, height)
  },

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

  hideTooltip(entity) {
    entity.tooltip = null
  },

  moveTooltip(entity, position) {
    if (!entity.tooltip) return
    entity.tooltipX = position.x
    entity.tooltipY = position.y
  },
}
