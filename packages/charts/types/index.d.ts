import type { Api, TemplateResult } from "@inglorious/web"

/**
 * One row of chart data. Cartesian charts take any of these shapes:
 * - rows with an x value (`name`, `label`, `date` or `x`) and one numeric
 *   field per series: `{ name: "Jan", sales: 10, costs: 4 }`
 * - points with a single value: `{ name: "Jan", value: 10 }`, `{ x: 0, y: 10 }`
 *   or a bare number
 * - one entry per series: `{ dataKey: "sales", values: [{ name: "Jan", value: 10 }] }`
 *
 * Pie, donut and radial charts take slices: `{ label: "Apples", value: 10, color?: "#f00" }`.
 * Radar charts take rows, as bar charts do.
 * Scatter charts take series of points: `{ name: "A", points: [{ x: 1, y: 2, z?: 3 }] }`.
 */
export type ChartDatum = Record<string, unknown> | number

/** Space around the plot: the same on every side, or per side. */
export type ChartPadding =
  number | { top?: number; right?: number; bottom?: number; left?: number }

/** A length in pixels, or a percentage of the chart as a string: `"50%"`. */
export type ChartLength = number | string

/** A value for an SVG presentation attribute, such as `strokeWidth`. */
export type SvgNumber = number | string

/** The visible window of the data, which a `Brush` lets the user drag. */
export interface ChartBrush {
  enabled?: boolean
  /** Defaults to 30. */
  height?: number
  /** The first row in the window. Defaults to 0. */
  startIndex?: number
  /** The last row in the window. Defaults to the last row. */
  endIndex?: number
  /** Whether the brush itself is drawn. Defaults to true. */
  visible?: boolean
}

/** One series of a `Composed` chart in config mode. */
export interface ChartSeries {
  kind: "line" | "area" | "bar"
  dataKey: string
  [prop: string]: unknown
}

/** What both a chart entity and composition props can configure. */
export interface ChartConfig {
  /** Names the chart for assistive tech. Defaults to its type: `"line chart"`. */
  ariaLabel?: string
  /** Defaults to 800. */
  width?: number
  /** Defaults to 400. */
  height?: number
  data?: ChartDatum[]
  /** The series to plot. Inferred from the data when left out. */
  dataKeys?: string[]
  /** The series colors, in order. Defaults to a palette of eight. */
  colors?: string[]
  padding?: ChartPadding
  /** Defaults to true. */
  hasGrid?: boolean
  /** Defaults to false. On a pie or donut, it names the slices. */
  hasLegend?: boolean
  /** Defaults to false. */
  hasTooltip?: boolean
  brush?: ChartBrush
  /** Stacks the series of an area or bar chart. */
  isStacked?: boolean
  /**
   * Bar charts: `"horizontal"` runs the bars sideways, the categories down
   * the left and the values along the bottom. Defaults to `"vertical"`.
   */
  orientation?: "vertical" | "horizontal"
  /** How the lines of a line or area chart run between points. Defaults to `"linear"`. */
  curve?: ChartCurve
  /** A title under the x axis. */
  xAxisLabel?: string
  /** A title beside the y axis. */
  yAxisLabel?: string
  /** Draws a dot on each point of a line or area chart. Defaults to true for lines, false for areas. */
  hasDots?: boolean
  /** The series of a `Composed` chart. */
  series?: ChartSeries[]

  /** Pie, donut and radial charts: the field with each slice's value. Defaults to `"value"`. */
  dataKey?: string
  /** Pie, donut and radial charts: the field with each slice's label. Defaults to `"label"`. */
  nameKey?: string
  /** Pie, donut and radial charts: labels the slices. Defaults to true, or false with a legend. */
  hasLabel?: boolean
  /** Donut charts: the text in the middle. A pie with it becomes a donut. */
  centerText?: string
  /** Pie and donut charts: the center. Defaults to `"50%"`. */
  cx?: ChartLength
  cy?: ChartLength
  /** Pie and donut charts. Defaults to `"70%"`. */
  outerRadius?: ChartLength
  /** Pie and donut charts: a donut's hole. Defaults to 0, or `"25%"` for radial charts. */
  innerRadius?: ChartLength
  /**
   * Pie and donut charts: where the slices start and end, in degrees
   * clockwise from twelve o'clock. `-90` to `90` draws the top half.
   * Default to 0 and a full turn after the start.
   */
  startAngle?: number
  endAngle?: number
}

/** How a line runs between points: straight, smoothed, or in steps. */
export type ChartCurve = "linear" | "natural" | "monotone" | "step"

/**
 * A chart entity in config mode. Its `type` picks the chart: `"Line"`,
 * `"Area"`, `"Bar"`, `"Composed"`, `"Pie"`, `"Donut"`, `"Scatter"`, `"Radar"`
 * or `"Radial"`, or a name containing one, such as `"LineRT"`.
 */
export interface ChartEntity extends ChartConfig {
  id?: string
  type: string
  /** The hovered datum, set by `tooltipShow` and cleared by `tooltipHide`. */
  tooltip?: ChartTooltipTarget | null
  [key: string]: unknown
}

/**
 * What a chart entity's render can add to it: functions, which do not belong
 * in the store. A type wrapping `Chart` passes them in its own `render`:
 * `render: (entity, api) => Chart.render({ ...entity, yTickFormatter }, api)`.
 */
export interface ChartEntityRenderProps extends ChartEntity {
  /** Turns each x value into its label. Defaults to `String`. */
  xTickFormatter?: (value: unknown) => string
  /** Turns each y tick value into its label. Defaults to thousands separators: `1,000`. */
  yTickFormatter?: (value: number) => string
  /** Formats the tooltip's value, as `Tooltip`'s `formatter` does. */
  tooltipFormatter?: ChartTooltipFormatter
}

/**
 * Turns a tooltip's value into its text. `name` is the series' data key, or a
 * pie slice's name. A slice keeps its percentage after the formatted value.
 */
export type ChartTooltipFormatter = (
  value: unknown,
  name: string | null,
) => string

/** A hovered datum: its row, and the series it belongs to (none for a pie slice). */
export interface ChartTooltipTarget {
  index: number
  dataKey?: string | null
}

/** The props of `Chart.render` in composition mode. */
export interface ChartRenderProps extends ChartConfig {
  /** The primitives to draw. The chart type is inferred from them. */
  children: ChartPrimitive | ChartPrimitive[]
  /**
   * The id of the entity the chart reads its data from and keeps its state in:
   * the brush window, the hovered datum. Required for a `Brush`. Without one,
   * tooltips are the browser's own.
   */
  entity?: string
  id?: string
  /** Forces a chart type instead of inferring it from the children. */
  type?: string
  [key: string]: unknown
}

/** A building block of a composed chart, as the `Chart` factories return it. */
export interface ChartPrimitive<
  TType extends string = string,
  TProps extends object = object,
> {
  type: TType
  props: TProps
}

export interface CartesianGridProps {
  /** Defaults to `"#e5e7eb"`. */
  stroke?: string
  /** Defaults to `"5 5"`. */
  strokeDasharray?: string
}

export interface XAxisProps {
  /** The field with the x values. Defaults to the data's x key. */
  dataKey?: string
  /** Turns each x value into its label. Defaults to `String`. */
  tickFormatter?: (value: unknown) => string
  /**
   * How many labels to skip between the ones shown: 0 shows them all. By
   * default, as many are shown as fit without overlapping, keeping the last.
   */
  interval?: number
  /** The least space between labels, in pixels, when fitting them. Defaults to 5. */
  minTickGap?: number
  /** A title under the axis. */
  label?: string
}

export interface YAxisProps {
  /** Turns each tick value into its label. Defaults to thousands separators: `1,000`. */
  tickFormatter?: (value: number) => string
  /** A title beside the axis. */
  label?: string
}

/** What every series primitive shares. */
interface SeriesProps {
  /** The field to plot. */
  dataKey?: string
  /** Shows a tooltip for this series even when the chart has none. */
  hasTooltip?: boolean
}

export interface LineProps extends SeriesProps {
  stroke?: string
  /** Defaults to 3. */
  strokeWidth?: SvgNumber
  hasDots?: boolean
  /** How the line runs between points. Defaults to `"linear"`. */
  curve?: ChartCurve
}

export interface AreaProps extends SeriesProps {
  fill?: string
  stroke?: string
  /** Defaults to 0.3. */
  fillOpacity?: SvgNumber
  /** Defaults to 3. */
  strokeWidth?: SvgNumber
  hasDots?: boolean
  /** Areas with the same `stackId` stack on each other. */
  stackId?: string
  /** How the edge runs between points. Defaults to `"linear"`. */
  curve?: ChartCurve
}

export interface BarProps extends SeriesProps {
  fill?: string
  /** Bars with the same `stackId` stack on each other, in one place per category. */
  stackId?: string
}

export interface DotsProps extends SeriesProps {
  fill?: string
  stroke?: string
  /** Defaults to 2. */
  strokeWidth?: SvgNumber
  /** The dots' radius. Defaults to 4. */
  r?: SvgNumber
  /** Places the dots on the areas with the same `stackId`. */
  stackId?: string
}

export interface PieProps {
  /** The field with each slice's value. */
  dataKey?: string
  /** The field with each slice's label. */
  nameKey?: string
  hasLabel?: boolean
  /** Defaults to `"outside"`. */
  labelPosition?: "inside" | "outside"
  /** Whether labels show each slice's share. Defaults to true. */
  hasPercentage?: boolean
  hasTooltip?: boolean
  cx?: ChartLength
  cy?: ChartLength
  outerRadius?: ChartLength
  innerRadius?: ChartLength
  /** Where the slices start and end, in degrees clockwise from twelve o'clock. */
  startAngle?: number
  endAngle?: number
}

export interface ScatterProps {
  /** The name of the series to draw. */
  dataKey?: string
  fill?: string
  /** Defaults to 0.75. */
  fillOpacity?: SvgNumber
  /** The points' radius, for every point. Defaults to 5, or sized by each point's `z`. */
  r?: SvgNumber
  hasTooltip?: boolean
}

export interface PolarGridProps {
  stroke?: string
}

export interface PolarAngleAxisProps {
  /** Turns each category into its label. Defaults to `String`. */
  tickFormatter?: (value: unknown) => string
}

export interface RadarProps extends SeriesProps {
  fill?: string
  stroke?: string
  /** Defaults to 0.25. */
  fillOpacity?: SvgNumber
}

export interface RadialBarProps {
  /** The field with each ring's value. */
  dataKey?: string
  /** The field with each ring's label. */
  nameKey?: string
  /** Names each ring at its start. */
  hasLabel?: boolean
  hasTooltip?: boolean
  cx?: ChartLength
  cy?: ChartLength
  outerRadius?: ChartLength
  innerRadius?: ChartLength
  /**
   * Where the rings start, and where a full one ends, in degrees clockwise
   * from twelve o'clock. Default to 0 and three quarters round, leaving the
   * last quarter for the rings' names.
   */
  startAngle?: number
  endAngle?: number
}

export interface TooltipProps {
  /** Formats the value. Defaults to `String`. */
  formatter?: ChartTooltipFormatter
}

export interface LegendProps {
  /** The series to list. Defaults to the plotted ones. */
  dataKeys?: string[]
  /** Their colors, in order. Defaults to the series colors. */
  colors?: string[]
}

export interface BrushProps {
  /** The field labelling the brush. Defaults to the data's x key. */
  dataKey?: string
  height?: number
}

export type ChartType = {
  /** Fills in the defaults of a chart entity. */
  create(entity: ChartEntity): void
  /** Replaces the chart's data. */
  dataUpdate(entity: ChartEntity, data: ChartDatum[]): void
  /** Resizes the chart, keeping the size it does not name. */
  sizeUpdate(
    entity: ChartEntity,
    payload: { width?: number; height?: number },
  ): void
  /** Moves the brush window, kept within the data. */
  brushChange(
    entity: ChartEntity,
    payload: { startIndex?: number; endIndex?: number },
  ): void
  /** Shows the tooltip of a hovered datum. */
  tooltipShow(entity: ChartEntity, payload: ChartTooltipTarget): void
  tooltipHide(entity: ChartEntity): void

  /**
   * Draws a chart. With `children`, composes it from primitives; without,
   * draws an entity as configured.
   */
  render(
    source: ChartEntityRenderProps | ChartRenderProps,
    api?: Api,
  ): TemplateResult
}

/**
 * The chart type: register it for each chart entity's type
 * (`types: { Line: Chart, Pie: Chart }`), or call `Chart.render` with
 * primitives as `children`.
 */
export declare const Chart: ChartType

export function CartesianGrid(
  props?: CartesianGridProps,
): ChartPrimitive<"cartesian-grid", CartesianGridProps>
export function XAxis(props?: XAxisProps): ChartPrimitive<"x-axis", XAxisProps>
export function YAxis(props?: YAxisProps): ChartPrimitive<"y-axis", YAxisProps>
export function Line(props?: LineProps): ChartPrimitive<"line", LineProps>
export function Area(props?: AreaProps): ChartPrimitive<"area", AreaProps>
export function Bar(props?: BarProps): ChartPrimitive<"bar", BarProps>
export function Pie(props?: PieProps): ChartPrimitive<"pie", PieProps>
export function Dots(props?: DotsProps): ChartPrimitive<"dots", DotsProps>
/** One series of a scatter chart, by its name. */
export function Scatter(
  props?: ScatterProps,
): ChartPrimitive<"scatter", ScatterProps>
/** A radar chart's rings and spokes. */
export function PolarGrid(
  props?: PolarGridProps,
): ChartPrimitive<"polar-grid", PolarGridProps>
/** A radar chart's category names. */
export function PolarAngleAxis(
  props?: PolarAngleAxisProps,
): ChartPrimitive<"polar-angle-axis", PolarAngleAxisProps>
/** One series of a radar chart. */
export function Radar(props?: RadarProps): ChartPrimitive<"radar", RadarProps>
/** A radial chart's rings, one per row. */
export function RadialBar(
  props?: RadialBarProps,
): ChartPrimitive<"radial-bar", RadialBarProps>
/** Turns on tooltips for every series. */
export function Tooltip(
  props?: TooltipProps,
): ChartPrimitive<"tooltip", TooltipProps>
export function Legend(
  props?: LegendProps,
): ChartPrimitive<"legend", LegendProps>
/** A brush to choose the visible window of the data. Needs the chart's `entity`. */
export function Brush(props?: BrushProps): ChartPrimitive<"brush", BrushProps>

/** The fields a streamed chart keeps on its entity. */
export interface StreamEntity extends ChartEntity {
  /** The field the x values go in. Defaults to `"name"`. */
  streamXKey?: string
  /** The field the y values go in. Defaults to `"value"`. */
  streamYKey?: string
  /** The index of the last point added. */
  streamIndex?: number
  /** Writes x values as numbers rather than strings. */
  streamIndexAsNumber?: boolean
  /** The most points to keep. */
  maxHistory?: number
}

/**
 * Appends a point to a chart's data, dropping the oldest beyond `maxHistory`.
 * The point is `payload.point`, or one built from `payload.value` at the next
 * index.
 */
export function streamSlide(
  entity: StreamEntity,
  payload?: { point?: ChartDatum; value?: number; maxHistory?: number },
): void
