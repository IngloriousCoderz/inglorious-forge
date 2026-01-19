export const entities = {
  // Product Chart - for Recharts-style composition (only data, no width/height)
  productChart: {
    type: "line",
    data: [
      { name: 'A', uv: 400, pv: 240 },
      { name: 'B', uv: 300, pv: 456 },
      { name: 'C', uv: 300, pv: 139 },
      { name: 'D', uv: 200, pv: 980 },
      { name: 'E', uv: 278, pv: 390 },
      { name: 'F', uv: 189, pv: 480 },
    ],
  },

  // Line Chart - Config-first style
  salesLineChart: {
    type: "line",
    data: [
      { x: 0, y: 50 },
      { x: 1, y: 150 },
      { x: 2, y: 120 },
      { x: 3, y: 180 },
      { x: 4, y: 25 },
      { x: 5, y: 160 },
      { x: 6, y: 190 },
    ],
    width: 800,
    height: 400,
    showGrid: true,
    showLegend: false,
    showTooltip: true,
  },

  // Line Chart - Recharts-style composition (same data, different approach)
  salesLineChartRecharts: {
    type: "line",
    data: [
      { name: 'Day 1', value: 50 },
      { name: 'Day 2', value: 150 },
      { name: 'Day 3', value: 120 },
      { name: 'Day 4', value: 180 },
      { name: 'Day 5', value: 25 },
      { name: 'Day 6', value: 160 },
      { name: 'Day 7', value: 190 },
    ],
  },

  // Line Chart with multiple series
  multiSeriesLineChart: {
    type: "line",
    data: [
      {
        name: "Product A",
        values: [
          { x: 0, y: 10 },
          { x: 1, y: 250 },
          { x: 2, y: 320 },
          { x: 3, y: 280 },
        ],
      },
      {
        name: "Product B",
        values: [
          { x: 0, y: 280 },
          { x: 1, y: 120 },
          { x: 2, y: 600 },
          { x: 3, y: 460 },
        ],
      },
      {
        name: "Product C",
        values: [
          { x: 0, y: 160 },
          { x: 1, y: 90 },
          { x: 2, y: 210 },
          { x: 3, y: 230 },
        ],
      },
      {
        name: "Product D",
        values: [
          { x: 0, y: 230 },
          { x: 1, y: 145 },
          { x: 2, y: 190 },
          { x: 3, y: 400 },
        ],
      },
    ],
    width: 800,
    height: 400,
    showGrid: true,
    showTooltip: true,
  },

  // Area Chart - Simple
  salesAreaChart: {
    type: "area",
    data: [
      { x: 0, y: 50 },
      { x: 1, y: 150 },
      { x: 2, y: 120 },
      { x: 3, y: 180 },
      { x: 4, y: 25 },
      { x: 5, y: 160 },
      { x: 6, y: 190 },
    ],
    width: 800,
    height: 400,
    showGrid: true,
    showLegend: false,
    showTooltip: true,
  },

  // Area Chart with multiple series
  multiSeriesAreaChart: {
    type: "area",
    data: [
      {
        name: "Revenue",
        values: [
          { x: 0, y: 20 },
          { x: 1, y: 30 },
          { x: 2, y: 25 },
          { x: 3, y: 20 },
          { x: 4, y: 50 },
        ],
      },
      {
        name: "Expenses",
        values: [
          { x: 0, y: 80 },
          { x: 1, y: 120 },
          { x: 2, y: 90 },
          { x: 3, y: 140 },
          { x: 4, y: 150 },
        ],
      },
      {
        name: "Profit",
        values: [
          { x: 0, y: 100 },
          { x: 1, y: 150 },
          { x: 2, y: 120 },
          { x: 3, y: 180 },
          { x: 4, y: 200 },
        ],
      },
    ],
    width: 800,
    height: 400,
    showGrid: true,
    showTooltip: true,
  },

  // Area Chart with multiple series stacked
  multiSeriesAreaChartStacked: {
    type: "area",
    data: [
      {
        name: "Revenue",
        values: [
          { x: 0, y: 100 },
          { x: 1, y: 150 },
          { x: 2, y: 120 },
          { x: 3, y: 180 },
          { x: 4, y: 200 },
        ],
      },
      {
        name: "Expenses",
        values: [
          { x: 0, y: 80 },
          { x: 1, y: 120 },
          { x: 2, y: 90 },
          { x: 3, y: 140 },
          { x: 4, y: 150 },
        ],
      },
      {
        name: "Profit",
        values: [
          { x: 0, y: 20 },
          { x: 1, y: 30 },
          { x: 2, y: 25 },
          { x: 3, y: 20 },
          { x: 4, y: 50 },
        ],
      },
    ],
    width: 800,
    height: 400,
    showGrid: true,
    showTooltip: true,
    stacked: true,
  },

  // Bar Chart
  salesBarChart: {
    type: "bar",
    data: [
      { label: "Jan", value: 100 },
      { label: "Feb", value: 150 },
      { label: "Mar", value: 120 },
      { label: "Apr", value: 180 },
      { label: "May", value: 200 },
      { label: "Jun", value: 160 },
    ],
    width: 800,
    height: 400,
    showGrid: true,
    showTooltip: true,
  },

  // Pie Chart
  categoryPieChart: {
    type: "pie",
    data: [
      { label: "Category A", value: 20 },
      { label: "Category B", value: 35 },
      { label: "Category C", value: 15 },
      { label: "Category D", value: 10 },
      { label: "Category E", value: 10 },
      { label: "Category F", value: 25 },
    ],
    width: 500,
    height: 400,
    showTooltip: true,
  },

  // Donut Chart
  categoryDonutChart: {
    type: "donut",
    data: [
      { label: "Desktop", value: 45 },
      { label: "Mobile", value: 30 },
      { label: "Tablet", value: 15 },
      { label: "Other", value: 10 },
    ],
    width: 500,
    height: 400,
    centerText: "Total",
    innerRadiusRatio: 0.6,
    showTooltip: true,
  },

  // Pie Chart with custom position (cx, cy)
  pieCustomPosition: {
    type: "pie",
    data: [
      { label: "North", value: 30 },
      { label: "South", value: 25 },
      { label: "East", value: 20 },
      { label: "West", value: 25 },
    ],
    width: 500,
    height: 400,
    cx: "35%", // Custom X position
    cy: "35%", // Custom Y position
    showTooltip: true,
  },

  // Pie Chart with partial angle (startAngle, endAngle)
  piePartial: {
    type: "pie",
    data: [
      { label: "Q1", value: 25 },
      { label: "Q2", value: 30 },
      { label: "Q3", value: 20 },
      { label: "Q4", value: 25 },
    ],
    width: 500,
    height: 400,
    startAngle: 180, // Start at 180° (left)
    endAngle: 0, // End at 0° (right) - creates half circle
    showTooltip: true,
  },

  // Pie Chart with padding between sectors (paddingAngle)
  pieWithPadding: {
    type: "pie",
    data: [
      { label: "Red", value: 30 },
      { label: "Blue", value: 25 },
      { label: "Green", value: 20 },
      { label: "Yellow", value: 25 },
    ],
    width: 500,
    height: 400,
    paddingAngle: 5, // 5 degrees gap between sectors
    showTooltip: true,
  },

  // Pie Chart with minimum angle (minAngle)
  pieMinAngle: {
    type: "pie",
    data: [
      { label: "Large", value: 50 },
      { label: "Medium", value: 30 },
      { label: "Small", value: 5 }, // Very small, but will be at least minAngle
      { label: "Tiny", value: 3 }, // Very small, but will be at least minAngle
      { label: "Other", value: 12 },
    ],
    width: 500,
    height: 400,
    minAngle: 10, // Each sector has at least 10 degrees
    showTooltip: true,
  },

  // Pie Chart with rounded corners (cornerRadius)
  pieRounded: {
    type: "pie",
    data: [
      { label: "Option A", value: 30 },
      { label: "Option B", value: 25 },
      { label: "Option C", value: 20 },
      { label: "Option D", value: 25 },
    ],
    width: 500,
    height: 400,
    cornerRadius: 10, // Rounded edges
    showTooltip: true,
  },

  // Pie Chart with custom data structure (dataKey, nameKey)
  pieCustomData: {
    type: "pie",
    data: [
      { product: "Laptop", sales: 150 },
      { product: "Phone", sales: 200 },
      { product: "Tablet", sales: 100 },
      { product: "Watch", sales: 80 },
    ],
    width: 500,
    height: 400,
    dataKey: (d) => d.sales, // Extract value from "sales"
    nameKey: (d) => d.product, // Extract label from "product"
    showTooltip: true,
  },

  // Pie Chart combining multiple features
  pieAdvanced: {
    type: "pie",
    data: [
      { label: "Team A", value: 40 },
      { label: "Team B", value: 30 },
      { label: "Team C", value: 20 },
      { label: "Team D", value: 10 },
    ],
    width: 500,
    height: 400,
    paddingAngle: 3, // Space between sectors
    cornerRadius: 8, // Rounded edges
    minAngle: 5, // Minimum angle per sector
    showTooltip: true,
  },
}
