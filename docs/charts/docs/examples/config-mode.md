---
title: Config-first Mode
description: Render chart entities directly with predefined chart types.
---

# Config-first Mode

Config-first is the fastest way to ship charts.

## Entity example

```js
{
  type: "Bar",
  data: [
    { label: "Jan", value: 100 },
    { label: "Feb", value: 150 },
    { label: "Mar", value: 120 },
  ],
  width: 800,
  height: 400,
  hasGrid: true,
  hasTooltip: true,
  hasLegend: false,
}
```

Render it with:

```js
api.render("salesBarChart")
```

## Formatting ticks and tooltips

Functions do not go in the entity. To format the axis labels or the tooltip's value, give the chart a type that wraps `Chart` and passes `xTickFormatter`, `yTickFormatter` or `tooltipFormatter` in its `render`:

```js
const PercentLine = {
  ...Chart,
  render(entity, api) {
    return Chart.render(
      {
        ...entity,
        yTickFormatter: (value) => `${value}%`,
        tooltipFormatter: (value) => `${value}%`,
      },
      api,
    )
  },
}
```

## Good fit

- Standard dashboards
- Faster implementation
- Teams that prefer data config over render composition
