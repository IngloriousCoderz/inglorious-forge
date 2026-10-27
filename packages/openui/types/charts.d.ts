import type { DefinedComponent } from "@openuidev/lang-core"

import type { AnyInglorousComponent } from "./index.js"

type ChartComponent = DefinedComponent<
  import("zod").ZodObject,
  AnyInglorousComponent
>

/** One data series: its name, and one value per label. */
export declare const Series: ChartComponent
/** Vertical bars: `BarChart(labels, series, variant, xLabel, yLabel, height)`, `"grouped"` or `"stacked"`. */
export declare const BarChart: ChartComponent
/** Lines over labels: `LineChart(labels, series, variant, xLabel, yLabel, height)`, `"linear"`, `"natural"` or `"step"`. */
export declare const LineChart: ChartComponent
/** Filled areas under lines: `AreaChart(labels, series, variant, xLabel, yLabel, height)`. */
export declare const AreaChart: ChartComponent
/** Slices of a whole: `PieChart(labels, values, variant, appearance)`. */
export declare const PieChart: ChartComponent
/** Horizontal bars: `HorizontalBarChart(labels, series, variant, xLabel, yLabel)`. */
export declare const HorizontalBarChart: ChartComponent
/** One bar split into the parts of a whole: `SingleStackedBarChart(labels, values)`. */
export declare const SingleStackedBarChart: ChartComponent
/** A web of measures: `RadarChart(labels, series)`. */
export declare const RadarChart: ChartComponent
/** A ring per value: `RadialChart(labels, values)`. */
export declare const RadialChart: ChartComponent
/** Points by two numbers: `ScatterChart(datasets, xLabel, yLabel)`. */
export declare const ScatterChart: ChartComponent
/** A named set of points: `ScatterSeries(name, points)`. */
export declare const ScatterSeries: ChartComponent
/** A point: `Point(x, y, z)`, `z` sizing it. */
export declare const Point: ChartComponent

/**
 * The charts, to add to a library:
 * `uiLibrary.extend({ components: { add: chartComponents } })`.
 * They need `@inglorious/charts` and its stylesheets in the app.
 */
export declare const chartComponents: ChartComponent[]
