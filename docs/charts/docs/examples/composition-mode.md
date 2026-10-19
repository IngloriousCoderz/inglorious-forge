---
title: Composition Mode
description: Build charts with reusable chart helper primitives.
---

# Composition Mode

Composition mode gives control over chart internals.

```js
import {
  CartesianGrid,
  Chart,
  Dots,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "@inglorious/charts"

Chart.render(
  {
    entity: "salesLineChartComposition",
    width: 800,
    height: 400,
    dataKeys: ["value"],
    children: [
      CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
      XAxis({ dataKey: "name" }),
      YAxis(),
      Line({ dataKey: "value", stroke: "#8884d8" }),
      Dots({ dataKey: "value", fill: "#8884d8" }),
      Tooltip(),
    ],
  },
  api,
)
```

`entity` names the store entity the chart reads its data from and keeps its state in: the hovered datum, and the window of a `Brush`. A chart without one can still show tooltips, the browser's own, but cannot have a brush.

## Good fit

- Custom visualization requirements
- Shared component libraries for chart pieces
- Incremental migration from Recharts-style APIs
