export const entities = {
  // ============================================
  // LINE CHARTS
  // ============================================

  // Line Chart - Config Style
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

  // Line Chart - Composition Style
  salesLineChartComposition: {
    type: "line",
    data: [
      { name: "0", value: 50 },
      { name: "1", value: 150 },
      { name: "2", value: 120 },
      { name: "3", value: 180 },
      { name: "4", value: 25 },
      { name: "5", value: 160 },
      { name: "6", value: 190 },
    ],
  },

  // Line Chart with Brush - Config Style
  lineChartWithBrushConfig: {
    type: "line",
    data: Array.from({ length: 30 }, (_, i) => ({
      name: `${i}`,
      value: Math.floor(Math.random() * 1000) + 100,
    })),
    width: 800,
    height: 400,
    showGrid: true,
    showTooltip: true,
    brush: {
      enabled: true,
      height: 30,
    },
  },

  // Line Chart with Brush - Composition Style
  lineChartWithBrush: {
    type: "line",
    data: Array.from({ length: 30 }, (_, i) => ({
      name: `${i}`,
      value: Math.floor(Math.random() * 1000) + 100,
    })),
  },

  // Line Chart with multiple series - Config Style
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

  // Line Chart with multiple series - Composition Style
  multiSeriesLineChartComposition: {
    type: "line",
    data: [
      { name: "0", productA: 10, productB: 280, productC: 160, productD: 230 },
      { name: "1", productA: 250, productB: 120, productC: 90, productD: 145 },
      { name: "2", productA: 320, productB: 600, productC: 210, productD: 190 },
      { name: "3", productA: 280, productB: 460, productC: 230, productD: 400 },
    ],
  },

  // Realtime Line Chart - Sliding Window (Config Style)
  realtimeLineChartConfig: {
    type: "line",
    realtime: {
      enabled: true,
      // override example:
      // intervalMs: 500,
    },
    width: 800,
    height: 400,
    showGrid: true,
    showLegend: false,
    showTooltip: true,
  },

  // Realtime Line Chart - Sliding Window (Composition Style)
  realtimeLineChart: {
    type: "line",
    realtime: {
      enabled: true,
      // override example:
      // intervalMs: 500,
    },
  },

  // ============================================
  // AREA CHARTS
  // ============================================

  // Area Chart - Config Style
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

  // Area Chart - Composition Style
  salesAreaChartComposition: {
    type: "area",
    data: [
      { name: "0", value: 50 },
      { name: "1", value: 150 },
      { name: "2", value: 120 },
      { name: "3", value: 180 },
      { name: "4", value: 25 },
      { name: "5", value: 160 },
      { name: "6", value: 190 },
    ],
  },

  // Area Chart with multiple series - Config Style
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

  // Area Chart with multiple series - Composition Style
  multiSeriesAreaChartComposition: {
    type: "area",
    data: [
      { name: "0", Revenue: 20, Expenses: 80, Profit: 100 },
      { name: "1", Revenue: 30, Expenses: 120, Profit: 150 },
      { name: "2", Revenue: 25, Expenses: 90, Profit: 120 },
      { name: "3", Revenue: 20, Expenses: 140, Profit: 180 },
      { name: "4", Revenue: 50, Expenses: 150, Profit: 200 },
    ],
  },

  // Area Chart with multiple series stacked - Config Style
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

  // Area Chart with multiple series stacked - Composition Style
  // Note: Order matters for stacked! Revenue (base), Expenses (middle), Profit (top)
  // Using same x values as Config to match X-axis labels
  multiSeriesAreaChartStackedComposition: {
    type: "area",
    data: [
      { name: "0", x: 0, Revenue: 100, Expenses: 80, Profit: 20 },
      { name: "1", x: 1, Revenue: 150, Expenses: 120, Profit: 30 },
      { name: "2", x: 2, Revenue: 120, Expenses: 90, Profit: 25 },
      { name: "3", x: 3, Revenue: 180, Expenses: 140, Profit: 20 },
      { name: "4", x: 4, Revenue: 200, Expenses: 150, Profit: 50 },
    ],
  },

  // ============================================
  // BAR CHARTS
  // ============================================

  // Bar Chart - Config Style
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

  // Bar Chart - Composition Style
  salesBarChartComposition: {
    type: "bar",
    data: [
      { label: "Jan", value: 100 },
      { label: "Feb", value: 150 },
      { label: "Mar", value: 120 },
      { label: "Apr", value: 180 },
      { label: "May", value: 200 },
      { label: "Jun", value: 160 },
    ],
  },

  // ============================================
  // PIE CHARTS
  // ============================================

  // Pie Chart - Config Style
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

  // Pie Chart - Composition Style
  categoryPieChartComposition: {
    type: "pie",
    data: [
      { name: "Category A", value: 20 },
      { name: "Category B", value: 35 },
      { name: "Category C", value: 15 },
      { name: "Category D", value: 10 },
      { name: "Category E", value: 10 },
      { name: "Category F", value: 25 },
    ],
  },

  // Pie Chart with custom position - Config Style
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

  // Pie Chart with custom position - Composition Style
  pieCustomPositionComposition: {
    type: "pie",
    data: [
      { name: "North", value: 30 },
      { name: "South", value: 25 },
      { name: "East", value: 20 },
      { name: "West", value: 25 },
    ],
  },

  // Pie Chart with partial angle - Config Style
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

  // Pie Chart with partial angle - Composition Style
  piePartialComposition: {
    type: "pie",
    data: [
      { name: "Q1", value: 25 },
      { name: "Q2", value: 30 },
      { name: "Q3", value: 20 },
      { name: "Q4", value: 25 },
    ],
  },

  // Pie Chart with padding - Config Style
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

  // Pie Chart with padding - Composition Style
  pieWithPaddingComposition: {
    type: "pie",
    data: [
      { name: "Red", value: 30 },
      { name: "Blue", value: 25 },
      { name: "Green", value: 20 },
      { name: "Yellow", value: 25 },
    ],
  },

  // Pie Chart with minimum angle - Config Style
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

  // Pie Chart with minimum angle - Composition Style
  pieMinAngleComposition: {
    type: "pie",
    data: [
      { name: "Large", value: 50 },
      { name: "Medium", value: 30 },
      { name: "Small", value: 5 },
      { name: "Tiny", value: 3 },
      { name: "Other", value: 12 },
    ],
  },

  // Pie Chart with rounded corners - Config Style
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

  // Pie Chart with rounded corners - Composition Style
  pieRoundedComposition: {
    type: "pie",
    data: [
      { name: "Option A", value: 30 },
      { name: "Option B", value: 25 },
      { name: "Option C", value: 20 },
      { name: "Option D", value: 25 },
    ],
  },

  // Pie Chart with custom data structure - Config Style
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

  // Pie Chart with custom data structure - Composition Style
  pieCustomDataComposition: {
    type: "pie",
    data: [
      { product: "Laptop", sales: 150 },
      { product: "Phone", sales: 200 },
      { product: "Tablet", sales: 100 },
      { product: "Watch", sales: 80 },
    ],
  },

  // Pie Chart combining multiple features - Config Style
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

  // Pie Chart combining multiple features - Composition Style
  pieAdvancedComposition: {
    type: "pie",
    data: [
      { name: "Team A", value: 40 },
      { name: "Team B", value: 30 },
      { name: "Team C", value: 20 },
      { name: "Team D", value: 10 },
    ],
  },

  // ============================================
  // DONUT CHARTS
  // ============================================

  // Donut Chart - Config Style
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

  // Donut Chart - Composition Style
  categoryDonutChartComposition: {
    type: "pie",
    data: [
      { name: "Desktop", value: 45 },
      { name: "Mobile", value: 30 },
      { name: "Tablet", value: 15 },
      { name: "Other", value: 10 },
    ],
  },

  // ============================================
  // HELPER ENTITIES (for Composition examples)
  // ============================================

  // Product Chart - for Line Chart Recharts-style composition
  productLineChart: {
    type: "line",
    data: [
      { name: "0", uv: 50 },
      { name: "1", uv: 150 },
      { name: "2", uv: 120 },
      { name: "3", uv: 180 },
      { name: "4", uv: 25 },
      { name: "5", uv: 160 },
      { name: "6", uv: 190 },
    ],
  },

  // Product Chart - for Area Chart Recharts-style composition
  productAreaChart: {
    type: "area",
    data: [
      { name: "0", uv: 50 },
      { name: "1", uv: 150 },
      { name: "2", uv: 120 },
      { name: "3", uv: 180 },
      { name: "4", uv: 25 },
      { name: "5", uv: 160 },
      { name: "6", uv: 190 },
    ],
  },

  // Product Chart - for Bar Chart Recharts-style composition
  productBarChart: {
    type: "bar",
    data: [
      { name: "A", uv: 400, pv: 240 },
      { name: "B", uv: 300, pv: 456 },
      { name: "C", uv: 300, pv: 139 },
      { name: "D", uv: 200, pv: 980 },
      { name: "E", uv: 278, pv: 390 },
      { name: "F", uv: 189, pv: 480 },
    ],
  },
}
