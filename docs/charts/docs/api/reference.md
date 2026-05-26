---
title: API Reference
description: Public API of @inglorious/charts.
---

# API Reference

## Exports

```js
import { Chart, streamSlide } from "@inglorious/charts"
```

## `Chart`

A single object for **config mode** (`api.render(entityId)`) and **composition** (`Chart.render` with `children`).

- Register the same handler for each chart entity kind in the store (`Line: Chart`, `Area: Chart`, …). The entity `type` field (`"Line"`, `"Area"`, …) drives defaults and primitives.
- **`Chart.render(props, api)`**: when `props.children` is set, runs composition (`createFrameFromRender`); without `children`, treats `props` as an entity snapshot (`createFrameFromEntity`).

### Factories (composition)

- `Chart.CartesianGrid(config)`
- `Chart.XAxis(config)`
- `Chart.YAxis(config)`
- `Chart.Line(config)`
- `Chart.Area(config)`
- `Chart.Bar(config)`
- `Chart.Pie(config)`
- `Chart.Dots(config)`
- `Chart.Tooltip(config)`
- `Chart.Legend(config)`
- `Chart.Brush(config)`

### Example (composition)

```js
Chart.render(
  {
    entity: "salesLine",
    width: 800,
    height: 400,
    dataKeys: ["value"],
    children: [
      Chart.CartesianGrid(),
      Chart.XAxis({ dataKey: "name" }),
      Chart.YAxis(),
      Chart.Line({ dataKey: "value" }),
      Chart.Tooltip({}),
    ],
  },
  api,
)
```

## `streamSlide`

Utility for a sliding window over realtime data (see the package `realtime` entry when using `withRealtime`).

## Events

Main handlers: `dataUpdate`, `sizeUpdate`, `tooltipShow`, `tooltipMove`, `tooltipHide`, `brushChange` — dispatched via `api.notify(...)`.
