/* eslint-disable no-magic-numbers */

const DEFAULT_BRUSH_HEIGHT = 30
const DEFAULT_HEIGHT = 400
const DEFAULT_WIDTH = 800
const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
]

export function create(entity) {
  entity.width ??= DEFAULT_WIDTH
  entity.height ??= DEFAULT_HEIGHT
  entity.data ??= []
  entity.showGrid ??= true
  entity.showLegend ??= false
  entity.showTooltip ??= true
  entity.colors ??= [...PALETTE]

  if (entity.brush?.enabled) {
    entity.brush.height ??= DEFAULT_BRUSH_HEIGHT
    entity.brush.startIndex ??= 0
    entity.brush.endIndex ??= Math.max(0, entity.data.length - 1)
    entity.brush.visible ??= true
  }
}

export function dataUpdate(entity, data) {
  entity.data = Array.isArray(data) ? data : []
}

export function sizeUpdate(entity, payload) {
  entity.width = payload?.width ?? entity.width ?? DEFAULT_WIDTH
  entity.height = payload?.height ?? entity.height ?? DEFAULT_HEIGHT
}

export function brushChange(entity, payload) {
  if (!entity.brush?.enabled) {
    entity.brush = {
      enabled: true,
      height: DEFAULT_BRUSH_HEIGHT,
    }
  }

  const maxIndex = Math.max(0, (entity.data?.length || 0) - 1)
  const nextStart = Math.max(0, Math.min(payload?.startIndex ?? 0, maxIndex))
  const nextEnd = Math.max(
    nextStart,
    Math.min(payload?.endIndex ?? maxIndex, maxIndex),
  )

  entity.brush.startIndex = nextStart
  entity.brush.endIndex = nextEnd
}
