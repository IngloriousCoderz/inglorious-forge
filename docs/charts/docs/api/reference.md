---
title: API Reference
description: Public API of @inglorious/charts.
---

# API Reference

## Exports

```js
import {
  areaChart,
  barChart,
  chart,
  donutChart,
  lineChart,
  pieChart,
} from "@inglorious/charts"
```

## Config-first chart types

- `lineChart`
- `areaChart`
- `barChart`
- `pieChart`
- `donutChart`

Use these as entity types in `createStore({ types })`.

## `chart` helper (composition mode)

### Main methods

- `chart.renderLineChart(entity, params, api)`
- `chart.renderAreaChart(entity, params, api)`
- `chart.renderBarChart(entity, params, api)`
- `chart.renderPieChart(entity, params, api)`

### Child factories

- `chart.CartesianGrid(config)`
- `chart.XAxis(config)`
- `chart.YAxis(config)`
- `chart.Line(config)`
- `chart.Area(config)`
- `chart.Bar(config)`
- `chart.Pie(config)`
- `chart.Dots(config)`
- `chart.Tooltip(config)`
- `chart.Legend(config)`
- `chart.Brush(config)`

### Entity-scoped helper

- `chart.forEntity(entityId, api)`
- `chart.forEntityInline(api, tempEntity?)`

These return a bound instance with the same rendering methods for concise local composition.

## Events handled by chart types

Core handlers include:

- `dataUpdate`
- `sizeUpdate`
- `tooltipShow`
- `tooltipMove`
- `tooltipHide`
- `brushChange`

All handlers are event-driven through `api.notify(...)`.
