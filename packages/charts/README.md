# Inglorious Charts

A powerful, declarative charting library for Inglorious Web, inspired by Recharts. Built with SVG and `lit-html`, Inglorious Charts provides a flexible and composable way to create beautiful data visualizations.

## Features

- 📊 **Multiple Chart Types**: Line, Area, Bar, Pie, and Donut charts
- 🎨 **Two Rendering Modes**: Config-first (declarative) and Composition (Recharts-style)
- 🧩 **Pure & Stateless**: Core logic built with pure functions for predictable rendering and easy testing
- 🎯 **Interactive Tooltips**: Smart tooltip positioning with automatic overflow detection
- 📈 **Multiple Series Support**: Render multiple data series in a single chart
- 🎨 **Customizable Styling**: Full control over colors, sizes, and appearance
- 📱 **Responsive**: Works seamlessly across different screen sizes
- 🔧 **Type-Safe**: Built with TypeScript definitions
- 🛡️ **Memory-Safe**: No global caches or Singletons, preventing memory leaks in complex SPAs
- 🚀 **Deterministic Rendering**: Optimized rendering engine that avoids expensive try/catch operations and ensures visual stability

## Installation

```bash
npm install @inglorious/charts
# or
pnpm add @inglorious/charts
```

## Quick Start

### Config-First Mode

The simplest way to create charts is using the config-first approach. First, register the chart types in your store:

```javascript
// In your store/index.js
import { createStore } from "@inglorious/web"
import {
  lineChart,
  areaChart,
  barChart,
  pieChart,
  donutChart,
} from "@inglorious/charts"

export const store = createStore({
  types: {
    line: lineChart,
    area: areaChart,
    bar: barChart,
    pie: pieChart,
    donut: donutChart,
  },
  entities,
  middlewares,
})
```

Then define your chart entity in the store:

```javascript
// In your store/entities.js
export const entities = {
  myLineChart: {
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

Finally, render the chart in your component:

```javascript
// In your app.js
import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html` ${api.render("myLineChart")} `
  },
}
```

### Composition Mode

For more control and flexibility, use the composition approach. First, define your chart entity in the store:

```javascript
// In your store/entities.js
export const entities = {
  myLineChart: {
    type: "line",
    data: [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
      { name: "Mar", value: 500 },
    ],
  },
}
```

Then use the `chart` helper in your component:

```javascript
import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

export const app = {
  render(api) {
    return html`
      ${chart(api, "myLineChart", (c) =>
        c.renderLineChart(
          [
            c.renderCartesianGrid({ stroke: "#eee", strokeDasharray: "5 5" }),
            c.renderXAxis({ dataKey: "name" }),
            c.renderYAxis({ width: "auto" }),
            c.renderLine({
              dataKey: "value",
              stroke: "#8884d8",
              showDots: true,
            }),
            c.renderTooltip({}),
          ],
          {
            width: 800,
            height: 400,
            dataKeys: ["value"], // Required to sync Y-axis scale across multiple series
            stacked: false, // Set to true to automatically sum values (Area/Bar)
          },
        ),
      )}
    `
  },
}
```

**Note:** The `chart` helper takes the `entityId` (e.g., `"myLineChart"`) and fetches the data from your store. You can also override the data by passing it in the config:

```javascript
c.renderLineChart(
  [
    /* components */
  ],
  {
    width: 800,
    height: 400,
    dataKeys: ["value"], // Required to sync Y-axis scale across multiple series
    stacked: false, // Set to true to automatically sum values (Area/Bar)
    data: [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
    ], // Override entity data
  },
)
```

💡 **Smart Layering**: The library uses an internal flag system (`isGrid`, `isAxis`, etc.) to ensure elements are rendered in the correct visual order (Z-index). The Grid will always be at the back and Axes always at the front, regardless of the order you declare them in the array.

## Chart Types

### Line Chart

Displays data as a connected line, ideal for showing trends over time.

**Config Mode:**

```javascript
{
  type: "line",
  data: [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 200 },
    { name: "Mar", value: 150 },
  ],
  showPoints: true, // Show dots on data points
}
```

**Composition Mode:**

```javascript
c.renderLineChart([
  c.renderLine({ dataKey: "value", stroke: "#8884d8", showDots: true }),
  // ... other components
])
```

### Area Chart

Similar to line charts but with filled areas under the line.

**Config Mode:**

```javascript
{
  type: "area",
  data: [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 200 },
    { name: "Mar", value: 150 },
  ],
  stacked: false, // Set to true for stacked areas
}
```

**Composition Mode:**

```javascript
c.renderAreaChart([
  c.renderArea({
    dataKey: "value",
    fill: "#8884d8",
    fillOpacity: "0.6",
    stroke: "#8884d8",
  }),
  c.renderDots({ dataKey: "value", fill: "#8884d8" }),
  // ... other components
])
```

### Bar Chart

Displays data as rectangular bars, perfect for comparing categories.

**Config Mode:**

```javascript
{
  type: "bar",
  data: [
    { name: "A", value: 100 },
    { name: "B", value: 200 },
    { name: "C", value: 150 },
  ],
}
```

**Composition Mode:**

```javascript
c.renderBarChart([
  c.renderBar({ dataKey: "value", fill: "#8884d8" }),
  // ... other components
])
```

### Pie Chart

Circular chart showing proportions of a whole.

**Config Mode:**

```javascript
{
  type: "pie",
  data: [
    { label: "A", value: 30 },
    { label: "B", value: 40 },
    { label: "C", value: 30 },
  ],
  cx: "50%", // Center X
  cy: "50%", // Center Y
  showTooltip: true,
}
```

### Donut Chart

Similar to pie chart but with a hollow center.

**Config Mode:**

```javascript
{
  type: "donut",
  data: [
    { label: "A", value: 30 },
    { label: "B", value: 40 },
    { label: "C", value: 30 },
  ],
  innerRadius: "60%", // Controls the hole size
}
```

## Composition Components

When using composition mode, you can combine these components:

**Note on Rendering:** Components like `renderLegend` and `renderTooltip` are rendered as HTML overlays, while `renderLine`, `renderArea`, or `renderBar` are rendered as SVG elements. The library handles this separation automatically to ensure accessibility and styling flexibility.

### `renderCartesianGrid`

Renders grid lines for cartesian charts.

```javascript
c.renderCartesianGrid({
  stroke: "#eee",
  strokeDasharray: "5 5",
})
```

### `renderXAxis`

Renders the X-axis with labels.

```javascript
c.renderXAxis({ dataKey: "name" })
```

### `renderYAxis`

Renders the Y-axis.

```javascript
c.renderYAxis({ width: "auto" })
```

### `renderLine`

Renders a line series.

```javascript
c.renderLine({
  dataKey: "value",
  stroke: "#8884d8",
  showDots: true, // Automatically render dots
  type: "linear", // Curve type: "linear", "monotone", etc.
})
```

### `renderArea`

Renders an area series.

```javascript
c.renderArea({
  dataKey: "value",
  fill: "#8884d8",
  fillOpacity: "0.6",
  stroke: "#8884d8",
  type: "linear",
})
```

### `renderBar`

Renders a bar series.

```javascript
c.renderBar({
  dataKey: "value",
  fill: "#8884d8",
})
```

### `renderDots`

Renders dots on data points (alternative to `showDots` in `renderLine`).

```javascript
c.renderDots({
  dataKey: "value",
  fill: "#8884d8",
  r: "0.25em",
  stroke: "white",
  strokeWidth: "0.125em",
})
```

### `renderLegend`

Renders a legend for multiple series.

```javascript
c.renderLegend({
  dataKeys: ["productA", "productB"],
  labels: ["Product A", "Product B"],
  colors: ["#8884d8", "#82ca9d"],
})
```

### `renderTooltip`

Renders the tooltip overlay.

```javascript
c.renderTooltip({})
```

## Data Formats

Inglorious Charts supports two data formats:

**Wide Format (Recharts Style)**: Useful for composition. A single object contains multiple keys.

```javascript
{
  name: "Jan",
  productA: 100,
  productB: 200,
  productC: 150,
}
```

**Long Format (Config Style)**: Ideal for dynamic APIs. Separate series with their own arrays.

```javascript
{
  name: "Product A",
  values: [
    { x: 0, y: 100 },
    { x: 1, y: 200 },
  ],
}
```

## Multiple Series

### Config Mode

For multiple series, use nested data structure:

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

Render multiple series by adding multiple components:

```javascript
import { html } from "@inglorious/web"
import { chart } from "@inglorious/charts"

// In your component
${chart(api, "multiSeriesChart", (c) =>
  c.renderLineChart([
    c.renderLegend({
      dataKeys: ["productA", "productB"],
      labels: ["Product A", "Product B"],
      colors: ["#8884d8", "#82ca9d"],
    }),
    c.renderLine({ dataKey: "productA", stroke: "#8884d8", showDots: true }),
    c.renderLine({ dataKey: "productB", stroke: "#82ca9d", showDots: true }),
    c.renderTooltip({}),
  ], {
    width: 800,
    height: 400,
    dataKeys: ["productA", "productB"], // Required to sync Y-axis scale across multiple series
    stacked: false,                     // Set to true to automatically sum values (Area/Bar)
  })
)}
```

## Styling

Import the base styles and theme:

```javascript
import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"
```

Or customize using CSS variables and classes:

- `.iw-chart` - Main chart container
- `.iw-chart-svg` - SVG element
- `.iw-chart-line` - Line elements
- `.iw-chart-area` - Area elements
- `.iw-chart-bar` - Bar elements
- `.iw-chart-dot` - Dot elements
- `.iw-chart-modal` - Tooltip element. Rendered as absolute HTML outside the SVG, giving you full freedom to use shadows, border-radius, and CSS transitions without SVG limitations.
- `.iw-chart-legend` - Legend element

## API Reference

### `chart(api, entityId, renderFn)`

Helper function for composition mode that provides bound chart methods.

**Parameters:**

- `api`: Inglorious Web API instance
- `entityId`: Entity ID from the store
- `renderFn`: Function that receives chart methods and returns chart configuration

**Returns:** `TemplateResult`

### `charts.render(entity, api)`

Renders a chart from an entity (config mode).

**Parameters:**

- `entity`: Chart entity object
- `api`: Inglorious Web API instance

**Returns:** `TemplateResult`

### Internal Render Method Signature

All render methods follow the standard signature pattern: `render<Sub>(entity, props, api)`

- `entity`: The chart entity object
- `props`: Configuration object with method-specific options
- `api`: Inglorious Web API instance

This pattern ensures consistency across all chart components and makes the API predictable for developers extending the library.

### Chart Entity Properties

Common properties for all chart entities:

- `type`: Chart type (`"line"`, `"area"`, `"bar"`, `"pie"`, `"donut"`)
- `data`: Array of data points
- `width`: Chart width in pixels (default: 800)
- `height`: Chart height in pixels (default: 400)
- `showGrid`: Show grid lines (default: true)
- `showTooltip`: Enable tooltips (default: true)
- `showLegend`: Show legend for multi-series (default: true)
- `colors`: Array of colors for series (optional)

## Examples

See the [examples directory](../../examples/apps/web-charts) for complete working examples of all chart types and rendering modes.

## License

MIT
