---
title: Config-first Mode
description: Render chart entities directly with predefined chart types.
---

# Config-first Mode

Config-first is the fastest way to ship charts.

## Entity example

```js
{
  type: "bar",
  data: [
    { label: "Jan", value: 100 },
    { label: "Feb", value: 150 },
    { label: "Mar", value: 120 },
  ],
  width: 800,
  height: 400,
  showGrid: true,
  showTooltip: true,
  showLegend: false,
}
```

Render it with:

```js
api.render("salesBarChart")
```

## Good fit

- Standard dashboards
- Faster implementation
- Teams that prefer data config over render composition
