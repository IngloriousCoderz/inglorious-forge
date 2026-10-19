---
title: API Reference
description: Public API of @inglorious/charts.
---

# API Reference

## Exports

```js
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  Chart,
  Dots,
  Legend,
  Line,
  Pie,
  streamSlide,
  Tooltip,
  XAxis,
  YAxis,
} from "@inglorious/charts"
import { withRealtime } from "@inglorious/charts/realtime"
```

## `Chart`

The chart type, for **config mode** (`api.render(entityId)`) and **composition** (`Chart.render` with `children`).

- Register it for each chart entity's type in the store (`Line: Chart`, `Area: Chart`, …). The entity's `type` (`"Line"`, `"Area"`, `"Bar"`, `"Composed"`, `"Pie"`, `"Donut"`) drives its defaults and primitives. In TypeScript it fits the store's `types` as it is, without a cast.
- **`Chart.render(props, api)`**: with `props.children`, composes the chart from primitives; without, draws `props` as a configured entity.
- **`ariaLabel`** (entity or props): names the chart for assistive tech. Defaults to its type, such as `"line chart"`.

Rendering only reads: it never writes to the entity it draws. What the user does on a chart reaches its entity as events (see [Events](#events)).

## Primitives

Composition builds a chart from primitives, passed as `children`:

| Primitive              | Props                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CartesianGrid(props)` | `stroke`, `strokeDasharray`                                                                                                                            |
| `XAxis(props)`         | `dataKey`, `tickFormatter`, `interval` (labels skipped between shown ones; by default as many as fit), `minTickGap`                                    |
| `YAxis(props)`         | `tickFormatter` (default: thousands separators)                                                                                                        |
| `Line(props)`          | `dataKey`, `stroke`, `strokeWidth`, `hasDots`, `hasTooltip`                                                                                            |
| `Area(props)`          | `dataKey`, `fill`, `stroke`, `fillOpacity`, `strokeWidth`, `hasDots`, `stackId`, `hasTooltip`                                                          |
| `Bar(props)`           | `dataKey`, `fill`, `hasTooltip`                                                                                                                        |
| `Dots(props)`          | `dataKey`, `fill`, `stroke`, `strokeWidth`, `r`, `stackId`, `hasTooltip`                                                                               |
| `Pie(props)`           | `dataKey`, `nameKey`, `hasLabel`, `labelPosition` (`"inside"` or `"outside"`), `hasPercentage`, `cx`, `cy`, `innerRadius`, `outerRadius`, `hasTooltip` |
| `Tooltip()`            | Turns on tooltips for every series.                                                                                                                    |
| `Legend(props)`        | `dataKeys`, `colors`                                                                                                                                   |
| `Brush(props)`         | `dataKey`, `height`. Needs the chart's `entity`.                                                                                                       |

```js
Chart.render(
  {
    entity: "salesLine",
    width: 800,
    height: 400,
    children: [
      CartesianGrid(),
      XAxis({ dataKey: "name" }),
      YAxis({ tickFormatter: (value) => `${value}%` }),
      Line({ dataKey: "value" }),
      Tooltip(),
    ],
  },
  api,
)
```

## State: `entity`

A chart keeps two kinds of state: the window its brush shows, and the datum the user hovers. Both live in its entity, changed by events. So:

- In config mode the chart is its entity, and has both.
- In composition, pass `entity: "<id>"` to read the data from that entity and keep the state in it.
- A `Brush` needs an entity: without one, `Chart.render` throws.
- Without an entity, tooltips are the browser's own, from an SVG `<title>`.

## Events

`Chart` handles these events, dispatched via `api.notify(...)`:

- `create`: fills in the defaults (size, colors, grid, brush window).
- `dataUpdate`: replaces `data` with the payload.
- `sizeUpdate`: sets `width` and `height` from the payload, keeping the one it does not name.
- `brushChange`: moves the brush window to `{ startIndex, endIndex }`, kept within the data. Dragging the brush dispatches it.
- `tooltipShow`: shows the tooltip of the datum `{ index, dataKey }`. Hovering a datum dispatches it.
- `tooltipHide`: hides it. Leaving the datum dispatches it.

## `withRealtime`

Makes a chart follow a stream of data that the app pushes: compose it in the store (`LiveLine: [Chart, withRealtime]`) or wrap it (`withRealtime(Chart)`). It adds these events:

- `streamPush`: adds a point. The payload is a number, put at the next index, or a whole data point.
- `streamPause`: freezes the chart and shows the brush, to look back through it. Points pushed meanwhile wait in `realtime.pending`.
- `streamPlay`: adds the points that waited, and follows the newest points again.

```js
setInterval(async () => {
  const { value } = await fetchLatestReading()
  api.notify("#temperature:streamPush", value)
}, 1000)
```

The entity's `realtime` field configures it: `visibleWindow`, how many of the latest points are shown while live (default 30), and `maxHistory`, the most points kept (default 2000). `realtime.isPaused` says whether the stream is paused.

## `streamSlide`

`streamSlide(entity, { value, point, maxHistory })` appends a point to `entity.data` and drops the oldest ones beyond `maxHistory`. The point is `point`, or one built from `value` at the next index, in the fields named by `entity.streamXKey` (default `"name"`) and `entity.streamYKey` (default `"value"`). `withRealtime` uses it; call it from your own handlers for the same behavior.

## Theming

Charts draw their text, axes, grid, brush and tooltip with these CSS custom properties, set on `.iw-chart` or any ancestor. `@inglorious/charts/theme.css` maps them to an Inglorious UI theme's tokens; without it, charts use their default colors.

| Property                | Used for                            |
| ----------------------- | ----------------------------------- |
| `--iw-chart-text`       | Labels and tooltip values           |
| `--iw-chart-text-muted` | Tick labels, legend, secondary text |
| `--iw-chart-axis`       | Axis lines, pie label connectors    |
| `--iw-chart-grid`       | Grid lines                          |
| `--iw-chart-surface`    | Tooltip and brush background        |
| `--iw-chart-border`     | Tooltip and brush border            |
| `--iw-chart-accent`     | Brush selection                     |

Series colors come from each entity's `colors`, or a primitive's own `stroke` and `fill`.
