---
title: Composition Mode
description: Build charts with reusable chart helper primitives.
---

# Composition Mode

Composition mode gives control over chart internals.

```js
import { Chart } from "@inglorious/charts"

Chart.render(
  {
    entity: "salesLineChartComposition",
    width: 800,
    height: 400,
    dataKeys: ["value"],
    children: [
      Chart.CartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
      Chart.XAxis({ dataKey: "name" }),
      Chart.YAxis({ width: "auto" }),
      Chart.Line({ dataKey: "value", stroke: "#8884d8" }),
      Chart.Dots({ dataKey: "value", fill: "#8884d8" }),
      Chart.Tooltip({}),
    ],
  },
  api,
)
```

## Good fit

- Custom visualization requirements
- Shared component libraries for chart pieces
- Incremental migration from Recharts-style APIs
