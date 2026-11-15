---
name: charts
description: "@inglorious/charts: SVG charts driven by entity config or composed primitives, with realtime streaming."
---

# @inglorious/charts

```js
import {
  Area, Bar, Brush, CartesianGrid, Chart, Dots, Legend, Line, Pie, PolarAngleAxis,
  PolarGrid, Radar, RadialBar, Scatter, streamSlide, Tooltip, XAxis, YAxis,
} from "@inglorious/charts";
import { withRealtime } from "@inglorious/charts/realtime";
import "@inglorious/charts/base.css";
import "@inglorious/charts/theme.css"; // maps --iw-chart-* to Inglorious UI tokens
```

`render` never writes to the entity. Brush and tooltip state change through `brushChange`, `tooltipShow`, `tooltipHide`, so stateful composition charts need an `entity` (`Brush` throws without one; tooltips fall back to `<title>`).

## Config mode

The visual type comes from the type name (`LiveLine` → line):

```js
const store = createStore({
  types: { Line: Chart, Bar: Chart, Area: Chart, Composed: Chart, Pie: Chart, Donut: Chart, LiveLine: [Chart, withRealtime] },
  entities,
});
```

Entity options: `isStacked`, `orientation: "horizontal"`, `curve`, `xAxisLabel`, `yAxisLabel`, `startAngle`, `endAngle`, `hasLegend`, `hasLabel`; types also `"Scatter"`, `"Radar"`, `"Radial"`. Functions never go in the entity; wrap `render`:

```js
const PercentLine = {
  ...Chart,
  render(entity, api) {
    return Chart.render({ ...entity, yTickFormatter: (v) => `${v}%`, tooltipFormatter: (v) => `${v}%` }, api);
  },
};
```

## Composition mode

The type is inferred from the children:

```js
Chart.render(
  { entity: "sales", width: 800, height: 400, children: [CartesianGrid(), XAxis({ dataKey: "name" }), YAxis(), Line({ dataKey: "value" }), Tooltip()] },
  api,
);
```

Primitives:

- `XAxis`/`YAxis`: `tickFormatter`, `label`; `XAxis` `interval`.
- `Line`/`Area`: `curve` `linear|natural|monotone|step`; `Area`/`Bar` stack by `stackId`.
- `Tooltip`: `formatter(value, name)`. `Legend`, `Dots`, `CartesianGrid`, `Brush`.
- `Scatter`: data `[{ name, points: [{ x, y, z }] }]`.
- `Pie`: `hasLabel`, `startAngle`/`endAngle` (degrees clockwise from 12).
- `PolarGrid`, `PolarAngleAxis`, `Radar` (row data); `RadialBar` (slice data).

## Realtime

`withRealtime` adds `streamPush` (number or data point), `streamPause` (queues into `realtime.pending`, shows brush), `streamPlay`. Options `entity.realtime.visibleWindow` (30), `maxHistory` (2000); state `isPaused`.

```js
api.notify("#temperature:streamPush", 21.5);
```

## Working on the package

- Booleans `isX`/`hasX`, never `showX`; say "primitives", not "components".
- `core/standardizer/` merges input and infers type; `core/engine/` renders SVG, colors via `theme.js`; defaults in `core/defaults.js`.
- Tests render with `@lit-labs/ssr`: `pnpm -C packages/charts test` and `lint`.
