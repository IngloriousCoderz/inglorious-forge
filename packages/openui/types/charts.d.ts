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

/**
 * The charts, to add to a library:
 * `uiLibrary.extend({ components: { add: chartComponents } })`.
 * They need `@inglorious/charts` and its stylesheets in the app.
 */
export declare const chartComponents: ChartComponent[]
