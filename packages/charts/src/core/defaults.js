export const DEFAULT_WIDTH = 800
export const DEFAULT_HEIGHT = 400
export const DEFAULT_BRUSH_HEIGHT = 30
/** The width of a character of 12px text, to estimate a label's width. */
export const CHAR_WIDTH = 7
/** The room an axis title takes, beside its tick labels. */
export const AXIS_LABEL_ROOM = 20
/** The room a legend takes above the plot, with one row of items. */
export const LEGEND_HEIGHT = 40
export const LEGEND_ITEM_WIDTH = 130
export const LEGEND_ROW_HEIGHT = 20
const AT_LEAST_ONE = 1

/** How many legend items fit on a row as wide as the plot. */
export function legendItemsPerRow(plotWidth) {
  return plotWidth
    ? Math.max(AT_LEAST_ONE, Math.floor(plotWidth / LEGEND_ITEM_WIDTH))
    : Infinity
}

export const DEFAULT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
]
