---
title: Getting Started
description: Install and render your first chart.
---

# Getting Started

## Install

```bash
pnpm add @inglorious/charts @inglorious/web
```

## Register chart types

```js
import { createStore } from "@inglorious/web"
import {
  lineChart,
  areaChart,
  barChart,
  pieChart,
  donutChart,
  chart,
} from "@inglorious/charts"

export const store = createStore({
  types: {
    line: lineChart,
    area: areaChart,
    bar: barChart,
    pie: pieChart,
    donut: donutChart,
    chart,
  },
  entities: {
    sales: {
      type: "line",
      data: [
        { name: "Jan", value: 100 },
        { name: "Feb", value: 160 },
        { name: "Mar", value: 120 },
      ],
      width: 800,
      height: 400,
      showGrid: true,
      showTooltip: true,
    },
  },
})
```

## Render a config-first chart

```js
import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`${api.render("sales")}`
  },
}
```

## Add base styles

```js
import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"
```
