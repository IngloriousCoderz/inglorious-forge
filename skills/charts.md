# @inglorious/charts - Complete Reference

## Installation

```bash
npm install @inglorious/charts
```

## Core Concepts

Declarative charting library for Inglorious Web, inspired by Recharts. Supports two rendering modes: Config-first (declarative) and Composition (Recharts-style).

**Architecture:**

- Pure functions for predictable rendering
- No global caches or Singletons
- Context-based data flow in Composition mode
- SVG-based rendering with lit-html

## Rendering Modes

### Config-First Mode

Simplest approach - define chart configuration in entity:

```javascript
import { lineChart } from "@inglorious/charts"

const types = { line: lineChart }
const entities = {
  myChart: {
    type: "line",
    data: [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
      { name: "Mar", value: 500 },
    ],
    width: 800,
    height: 400,
    showGrid: true,
    showTooltip: true,
    showLegend: true,
  },
}
```

### Composition Mode

More control - compose chart components. **Requires `chart` type to be registered in store:**

```javascript
// In store/index.js
import { charts, lineChart } from "@inglorious/charts"

export const store = createStore({
  types: {
    line: lineChart,
    chart: charts, // Required for chart() helper
  },
  entities,
})
```

Then use in component:

```javascript
import { chart } from "@inglorious/charts"

${chart(api, "myChart", (c) =>
  c.renderLineChart([
    c.renderCartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
    c.renderXAxis({ dataKey: "name" }),
    c.renderYAxis({ width: "auto" }),
    c.renderLine({ dataKey: "value", stroke: "#8884d8", showDots: true }),
    c.renderTooltip({}),
  ], {
    width: 800,
    height: 400,
    dataKeys: ["value"], // Required for Y-axis scale sync
    stacked: false,
  })
)}
```

## Chart Types

### Line Chart

**Config mode:**

```javascript
{
  type: "line",
  data: [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 200 },
  ],
  showPoints: true,
}
```

**Config mode with Brush (Zoom & Pan):**

```javascript
{
  type: "line",
  data: Array.from({ length: 100 }, (_, i) => ({
    name: `Point ${i}`,
    value: Math.floor(Math.random() * 1000) + 100,
  })),
  width: 800,
  height: 400,
  showGrid: true,
  showTooltip: true,
  brush: {
    enabled: true,
    height: 30, // Optional: brush height (default: 30)
  },
}
```

The brush allows users to zoom and pan through large datasets. When enabled:

- Brush appears below the main chart
- Drag handles to resize the visible range
- Drag the middle area to pan through data
- X-axis remains fixed (shows full range 0-99)
- Only the rendered data is filtered based on brush selection

**Composition mode:**

```javascript
c.renderLineChart([
  c.renderLine({ dataKey: "value", stroke: "#8884d8", showDots: true }),
])
```

### Area Chart

**Config mode:**

```javascript
{
  type: "area",
  data: [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 200 },
  ],
  stacked: false,
}
```

**Composition mode:**

```javascript
c.renderAreaChart([
  c.renderArea({
    dataKey: "value",
    fill: "#8884d8",
    fillOpacity: "0.6",
    stroke: "#8884d8",
  }),
])
```

### Bar Chart

**Config mode:**

```javascript
{
  type: "bar",
  data: [
    { name: "A", value: 100 },
    { name: "B", value: 200 },
  ],
}
```

**Composition mode:**

```javascript
c.renderBarChart([c.renderBar({ dataKey: "value", fill: "#8884d8" })])
```

### Pie Chart

```javascript
{
  type: "pie",
  data: [
    { label: "A", value: 30 },
    { label: "B", value: 40 },
    { label: "C", value: 30 },
  ],
  cx: "50%",
  cy: "50%",
}
```

### Donut Chart

```javascript
{
  type: "donut",
  data: [
    { label: "A", value: 30 },
    { label: "B", value: 40 },
  ],
  innerRadius: "60%",
}
```

## Composition Components

### renderCartesianGrid

Renders grid lines for cartesian charts:

```javascript
c.renderCartesianGrid({
  stroke: "#eee",
  strokeDasharray: "5 5",
})
```

### renderXAxis

Renders X-axis with labels:

```javascript
c.renderXAxis({ dataKey: "name" })
```

### renderYAxis

Renders Y-axis:

```javascript
c.renderYAxis({ width: "auto" })
```

### renderLine

Renders a line series:

```javascript
c.renderLine({
  dataKey: "value",
  stroke: "#8884d8",
  showDots: true,
  type: "linear", // "linear", "monotone", etc.
})
```

### renderArea

Renders an area series:

```javascript
c.renderArea({
  dataKey: "value",
  fill: "#8884d8",
  fillOpacity: "0.6",
  stroke: "#8884d8",
})
```

### renderBar

Renders a bar series:

```javascript
c.renderBar({
  dataKey: "value",
  fill: "#8884d8",
})
```

### renderDots

Renders dots on data points:

```javascript
c.renderDots({
  dataKey: "value",
  fill: "#8884d8",
  r: "0.25em",
})
```

### renderTooltip

Renders tooltip overlay:

```javascript
c.renderTooltip({})
```

### renderBrush

Renders brush for zoom/pan:

```javascript
c.renderBrush({
  dataKey: "name",
  height: 30,
})
```

### renderLegend

Renders legend for multiple series:

```javascript
c.renderLegend({
  dataKeys: ["productA", "productB"],
  labels: ["Product A", "Product B"],
  colors: ["#8884d8", "#82ca9d"],
})
```

## Multiple Series

### Config Mode

```javascript
{
  type: "line",
  data: [
    {
      name: "Product A",
      values: [
        { x: 0, y: 10 },
        { x: 1, y: 250 },
      ],
    },
    {
      name: "Product B",
      values: [
        { x: 0, y: 280 },
        { x: 1, y: 120 },
      ],
    },
  ],
  showLegend: true,
}
```

### Composition Mode

```javascript
${chart(api, "multiSeriesChart", (c) =>
  c.renderLineChart([
    c.renderLegend({
      dataKeys: ["productA", "productB"],
      labels: ["Product A", "Product B"],
      colors: ["#8884d8", "#82ca9d"],
    }),
    c.renderLine({ dataKey: "productA", stroke: "#8884d8" }),
    c.renderLine({ dataKey: "productB", stroke: "#82ca9d" }),
    c.renderTooltip({}),
  ], {
    width: 800,
    height: 400,
    dataKeys: ["productA", "productB"], // Required for Y-axis sync
  })
)}
```

## Data Formats

### Wide Format (Recharts Style)

Single object with multiple keys:

```javascript
{
  name: "Jan",
  productA: 100,
  productB: 200,
  productC: 150,
}
```

### Long Format (Config Style)

Separate series with arrays:

```javascript
{
  name: "Product A",
  values: [
    { x: 0, y: 100 },
    { x: 1, y: 200 },
  ],
}
```

## Context in Composition Mode

**CRITICAL:** In Composition mode, sub-components receive a `ctx` (CartesianContext) object.

### Context Structure

```javascript
{
  xScale: D3Scale,        // X-axis scale (configured with domain)
  yScale: D3Scale,        // Y-axis scale (configured with domain)
  displayData: Array,     // Filtered data (when Zoom/Brush active)
  dimensions: {
    width: number,
    height: number,
    padding: object,
  },
  entity: Entity,         // Original entity
}
```

### Rules for Context Usage

1. **ALWAYS use `ctx.displayData` for rendering** - Never use `entity.data` directly
2. **ALWAYS use `ctx.xScale` and `ctx.yScale`** - These are pre-configured with correct domains
3. **Brush uses full `entity.data` for preview** - But chart uses `ctx.displayData`
4. **Context is created by parent chart component** - Sub-components receive it automatically

## Brush (Zoom & Pan)

### Config Mode

```javascript
{
  type: "line",
  data: [...],
  brush: {
    enabled: true,
    startIndex: 0,
    endIndex: 99,
    dataKey: "name",
    height: 30,
  },
}
```

### Composition Mode

```javascript
c.renderLineChart([
  // ... other components
  c.renderBrush({ dataKey: "name", height: 30 }),
])
```

**Brush Rules:**

- Brush uses full `entity.data` for preview scale
- Chart uses `ctx.displayData` (filtered data) for rendering
- Brush updates `entity.brush.startIndex` and `endIndex`
- Chart automatically filters data based on brush range

## Styling

Import base styles:

```javascript
import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"
```

CSS classes:

- `.iw-chart` - Main chart container
- `.iw-chart-svg` - SVG element
- `.iw-chart-line` - Line elements
- `.iw-chart-area` - Area elements
- `.iw-chart-bar` - Bar elements
- `.iw-chart-dot` - Dot elements
- `.iw-chart-modal` - Tooltip element
- `.iw-chart-legend` - Legend element

## API Reference

### `chart(api, entityId, renderFn)`

Helper for Composition mode. **Requires `chart` type to be registered in store:**

```javascript
// In store/index.js
import { charts } from "@inglorious/charts"

export const store = createStore({
  types: {
    line: lineChart,
    chart: charts, // Required for chart() helper
  },
  entities,
})

// In component
chart(api, "myChart", (c) => c.renderLineChart([...], config))
```

**Parameters:**

- `api` - Inglorious Web API instance
- `entityId` - Entity ID string (e.g., `"myChart"`)
- `renderFn` - Callback that receives chart methods and returns template

### Chart Type Exports

```javascript
import {
  lineChart,
  areaChart,
  barChart,
  pieChart,
  donutChart,
} from "@inglorious/charts"
```

## Rules & Constraints

1. **In Composition mode, sub-components MUST use `ctx`** - Never access `entity.data` directly
2. **Use `ctx.displayData` for rendering** - Contains filtered data when Zoom/Brush is active
3. **Use `ctx.xScale` and `ctx.yScale` for positioning** - Pre-configured with correct domains
4. **Brush requires full `entity.data` for preview** - But chart rendering uses `ctx.displayData`
5. **Config mode handles filtering automatically** - Composition mode requires explicit context usage
6. **Always specify `dataKeys` in Composition mode** - Required to sync Y-axis scale across series

## Common Pitfalls

### ❌ Wrong: Using entity.data directly in Composition

```javascript
c.renderLineChart([
  c.renderLine({
    dataKey: "value",
    // Wrong - uses entity.data directly, breaks Zoom/Brush
  }),
])
```

### ✅ Correct: Use ctx.displayData from context

```javascript
// Context is automatically provided by parent chart component
c.renderLineChart([
  c.renderLine({
    dataKey: "value",
    // Correct - uses ctx.displayData from parent context
  }),
])
```

### ❌ Wrong: Missing dataKeys in Composition

```javascript
c.renderLineChart([c.renderLine({ dataKey: "value" })], {
  width: 800,
  height: 400,
  // Wrong - missing dataKeys, Y-axis won't sync
})
```

### ✅ Correct: Specify dataKeys

```javascript
c.renderLineChart([c.renderLine({ dataKey: "value" })], {
  width: 800,
  height: 400,
  dataKeys: ["value"], // Correct - Y-axis syncs correctly
})
```
