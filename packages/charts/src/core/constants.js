export const CHART_TYPES = {
  LINE: "line",
  AREA: "area",
  BAR: "bar",
  PIE: "pie",
  DONUT: "donut",
  COMPOSED: "composed",
}

export const COMPONENT_TYPES = {
  CARTESIAN_GRID: "CARTESIAN_GRID",
  X_AXIS: "X_AXIS",
  Y_AXIS: "Y_AXIS",
  LINE: "LINE",
  AREA: "AREA",
  BAR: "BAR",
  PIE: "PIE",
  DOTS: "DOTS",
  TOOLTIP: "TOOLTIP",
  LEGEND: "LEGEND",
  BRUSH: "BRUSH",
}

export const DEFAULT_WIDTH = 800
export const DEFAULT_HEIGHT = 400
export const DEFAULT_BRUSH_HEIGHT = 30
export const DEFAULT_TICK_COUNT = 5
export const DEFAULT_DOT_RADIUS = 4
export const DEFAULT_BAR_PADDING = 0.18
export const DEFAULT_LINE_PADDING = 0.1
export const DEFAULT_LEGEND_HEIGHT = 40
export const DEFAULT_BRUSH_GAP = 16

export const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
]

export const SERIES_COMPONENTS = [
  COMPONENT_TYPES.LINE,
  COMPONENT_TYPES.AREA,
  COMPONENT_TYPES.BAR,
]

export const X_VALUE_KEYS = ["name", "label", "date", "x"]

export const NON_SERIES_KEYS = new Set([
  "id",
  "type",
  "name",
  "label",
  "date",
  "x",
  "color",
])
