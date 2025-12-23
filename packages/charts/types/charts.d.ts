import type { TemplateResult } from "lit-html"
import type { Api } from "@inglorious/web/types/mount"

/**
 * Represents a data point for line/bar charts.
 */
export type ChartDataPoint = {
  x?: number | string | Date
  y?: number
  value?: number
  date?: Date | string | number
  label?: string
  name?: string
  category?: string
  values?: ChartDataPoint[]
  [key: string]: any
}

/**
 * Represents a data point for pie/donut charts.
 */
export type PieDataPoint = {
  label: string
  value: number
  color?: string
  [key: string]: any
}

/**
 * Represents padding configuration for charts.
 */
export type ChartPadding = {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Represents tooltip data for charts.
 */
export type ChartTooltip = {
  label: string
  percentage?: number
  value: number
  color: string
} | null

/**
 * Represents the position of a tooltip.
 */
export type TooltipPosition = {
  x: number
  y: number
}

/**
 * Label position options for pie/donut charts.
 */
export type LabelPosition = "inside" | "outside" | "tooltip" | "auto"

/**
 * X-axis type options.
 */
export type XAxisType = "time" | "linear"

/**
 * Represents the state of a chart entity.
 */
export interface ChartEntity {
  /** A unique identifier for the chart entity. */
  id: string | number
  /** The entity type (e.g., 'line', 'bar', 'area', 'pie', 'donut'). */
  type: string
  /** The width of the chart in pixels. */
  width: number
  /** The height of the chart in pixels. */
  height: number
  /** Padding configuration for the chart. */
  padding: ChartPadding
  /** The data to be displayed in the chart. */
  data: ChartDataPoint[] | PieDataPoint[]
  /** Array of colors to use for chart elements. */
  colors: string[]
  /** Whether to show the legend. */
  showLegend: boolean
  /** Whether to show the grid. */
  showGrid: boolean
  /** Whether to show tooltips. */
  showTooltip: boolean
  /** Current tooltip data, if any. */
  tooltip: ChartTooltip
  /** X position of the tooltip. */
  tooltipX: number
  /** Y position of the tooltip. */
  tooltipY: number
  /** Label position for pie/donut charts. */
  labelPosition: LabelPosition
  /** X-axis type (time or linear). */
  xAxisType?: XAxisType
}

/**
 * The charts type implementation.
 */
export declare const charts: {
  /**
   * Initializes the chart entity with default state.
   * @param {ChartEntity} entity
   */
  create(entity: ChartEntity): void

  /**
   * Updates the chart data.
   * @param entity The chart entity.
   * @param data The new data to display.
   */
  updateData(entity: ChartEntity, data: ChartDataPoint[] | PieDataPoint[]): void

  /**
   * Resizes the chart.
   * @param entity The chart entity.
   * @param width The new width in pixels.
   * @param height The new height in pixels.
   */
  resize(entity: ChartEntity, width: number, height: number): void

  /**
   * Shows a tooltip at the specified position.
   * @param entity The chart entity.
   * @param tooltipData The tooltip data and position.
   */
  showTooltip(
    entity: ChartEntity,
    tooltipData: {
      label: string
      percentage?: number
      value: number
      color: string
      x: number
      y: number
    },
  ): void

  /**
   * Hides the tooltip.
   * @param entity The chart entity.
   */
  hideTooltip(entity: ChartEntity): void

  /**
   * Moves the tooltip to a new position.
   * @param entity The chart entity.
   * @param position The new tooltip position.
   */
  moveTooltip(entity: ChartEntity, position: TooltipPosition): void

  /**
   * Renders the chart component.
   * @param entity The chart entity.
   * @param api The store API.
   */
  render(entity: ChartEntity, api: Api): TemplateResult
}
