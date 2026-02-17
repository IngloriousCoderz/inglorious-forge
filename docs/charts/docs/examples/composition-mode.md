---
title: Composition Mode
description: Build charts with reusable chart helper primitives.
---

# Composition Mode

Composition mode gives control over chart internals.

```js
import { chart } from "@inglorious/charts"

chart.renderLineChart(
  api.getEntity("salesLineChartComposition"),
  {
    width: 800,
    height: 400,
    dataKeys: ["value"],
    children: [
      chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
      chart.XAxis({ dataKey: "name" }),
      chart.YAxis({ width: "auto" }),
      chart.Line({ dataKey: "value", stroke: "#8884d8" }),
      chart.Dots({ dataKey: "value", fill: "#8884d8" }),
      chart.Tooltip({}),
    ],
  },
  api,
)
```

## Good fit

- Custom visualization requirements
- Shared component libraries for chart pieces
- Incremental migration from Recharts-style APIs
