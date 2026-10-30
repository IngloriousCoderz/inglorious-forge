const RANDOM_MIN = 100
const RANDOM_RANGE = 1000

export const entities = {
  salesLineChart: {
    type: "Line",
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
    hasGrid: true,
    hasLegend: false,
    hasTooltip: true,
  },

  salesLineChartComposition: {
    type: "Line",
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

  salesLineChartCompositionPadding: {
    type: "Line",
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

  lineChartWithBrushConfig: {
    type: "Line",
    data: Array.from({ length: 30 }, (_, i) => ({
      name: `${i}`,
      value: Math.floor(Math.random() * RANDOM_RANGE) + RANDOM_MIN,
    })),
    width: 800,
    height: 400,
    hasGrid: true,
    hasTooltip: true,
    brush: {
      enabled: true,
      height: 30,
    },
  },

  lineChartWithBrush: {
    type: "Line",
    data: Array.from({ length: 30 }, (_, i) => ({
      name: `${i}`,
      value: Math.floor(Math.random() * RANDOM_RANGE) + RANDOM_MIN,
    })),
  },

  multiSeriesLineChart: {
    type: "Line",
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
    hasGrid: true,
    hasTooltip: true,
    hasLegend: true,
  },

  multiSeriesLineChartComposition: {
    type: "Line",
    data: [
      { name: "0", productA: 10, productB: 280, productC: 160, productD: 230 },
      { name: "1", productA: 250, productB: 120, productC: 90, productD: 145 },
      { name: "2", productA: 320, productB: 600, productC: 210, productD: 190 },
      { name: "3", productA: 280, productB: 460, productC: 230, productD: 400 },
    ],
  },

  smoothLineChart: {
    type: "Line",
    data: [
      { label: "Mon", value: 12 },
      { label: "Tue", value: 30 },
      { label: "Wed", value: 18 },
      { label: "Thu", value: 42 },
      { label: "Fri", value: 26 },
    ],
    width: 800,
    height: 400,
    hasGrid: true,
    hasTooltip: true,
    curve: "natural",
    xAxisLabel: "Day",
    yAxisLabel: "Orders",
  },

  stepLineChartComposition: {
    type: "Line",
    data: [
      { label: "Mon", value: 12 },
      { label: "Tue", value: 30 },
      { label: "Wed", value: 18 },
      { label: "Thu", value: 42 },
      { label: "Fri", value: 26 },
    ],
  },

  realtimeLineChartConfig: {
    type: "Line-rt",
    width: 800,
    height: 400,
    hasGrid: true,
    hasLegend: false,
    hasTooltip: true,
  },

  realtimeLineChart: {
    type: "Line-rt",
  },

  salesAreaChart: {
    type: "Area",
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
    hasGrid: true,
    hasLegend: false,
    hasTooltip: true,
  },

  salesAreaChartComposition: {
    type: "Area",
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

  composedSalesChart: {
    type: "Composed",
    data: [
      { name: "Jan", revenue: 120, target: 80, forecast: 110 },
      { name: "Feb", revenue: 180, target: 130, forecast: 150 },
      { name: "Mar", revenue: 90, target: 140, forecast: 120 },
      { name: "Apr", revenue: 210, target: 170, forecast: 190 },
      { name: "May", revenue: 160, target: 220, forecast: 175 },
      { name: "Jun", revenue: 200, target: 180, forecast: 195 },
      { name: "Jul", revenue: 130, target: 190, forecast: 150 },
    ],
    width: 800,
    height: 400,
    hasTooltip: true,
    series: [
      {
        kind: "area",
        dataKey: "revenue",
        fill: "#8884d8",
        fillOpacity: "0.3",
        stroke: "#8884d8",
        hasDots: true,
        hasTooltip: true,
      },
      {
        kind: "bar",
        dataKey: "target",
        fill: "#82ca9d",
        hasTooltip: true,
      },
      {
        kind: "line",
        dataKey: "forecast",
        stroke: "#ff7300",
        hasDots: true,
      },
    ],
  },

  multiSeriesAreaChart: {
    type: "Area",
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
    hasGrid: true,
    hasTooltip: true,
    hasLegend: true,
  },

  multiSeriesAreaChartComposition: {
    type: "Area",
    data: [
      { name: "0", Revenue: 20, Expenses: 80, Profit: 100 },
      { name: "1", Revenue: 30, Expenses: 120, Profit: 150 },
      { name: "2", Revenue: 25, Expenses: 90, Profit: 120 },
      { name: "3", Revenue: 20, Expenses: 140, Profit: 180 },
      { name: "4", Revenue: 50, Expenses: 150, Profit: 200 },
    ],
  },

  multiSeriesAreaChartStacked: {
    type: "Area",
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
    hasGrid: true,
    hasTooltip: true,
    isStacked: true,
    hasLegend: true,
  },

  // Area Chart with multiple series stacked - Composition Style
  // Note: Order matters for stacked! Revenue (base), Expenses (middle), Profit (top)
  // Using same x values as Config to match X-axis labels
  multiSeriesAreaChartStackedComposition: {
    type: "Area",
    data: [
      { name: "0", x: 0, Revenue: 100, Expenses: 80, Profit: 20 },
      { name: "1", x: 1, Revenue: 150, Expenses: 120, Profit: 30 },
      { name: "2", x: 2, Revenue: 120, Expenses: 90, Profit: 25 },
      { name: "3", x: 3, Revenue: 180, Expenses: 140, Profit: 20 },
      { name: "4", x: 4, Revenue: 200, Expenses: 150, Profit: 50 },
    ],
  },

  salesBarChart: {
    type: "Bar",
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
    hasGrid: true,
    hasTooltip: true,
  },

  salesBarChartComposition: {
    type: "Bar",
    data: [
      { label: "Jan", value: 100 },
      { label: "Feb", value: 150 },
      { label: "Mar", value: 120 },
      { label: "Apr", value: 180 },
      { label: "May", value: 200 },
      { label: "Jun", value: 160 },
    ],
  },

  salesBarChartCompositionPadding: {
    type: "Bar",
    data: [
      { label: "Jan", value: 100 },
      { label: "Feb", value: 150 },
      { label: "Mar", value: 120 },
      { label: "Apr", value: 180 },
      { label: "May", value: 200 },
      { label: "Jun", value: 160 },
    ],
  },

  stackedBarChart: {
    type: "Bar",
    data: [
      { label: "Q1", online: 120, shop: 80 },
      { label: "Q2", online: 150, shop: 95 },
      { label: "Q3", online: 110, shop: 130 },
      { label: "Q4", online: 190, shop: 160 },
    ],
    width: 800,
    height: 400,
    hasGrid: true,
    hasTooltip: true,
    hasLegend: true,
    isStacked: true,
    xAxisLabel: "Quarter",
    yAxisLabel: "Sales",
  },

  stackedBarChartComposition: {
    type: "Bar",
    data: [
      { label: "Q1", online: 120, shop: 80 },
      { label: "Q2", online: 150, shop: 95 },
      { label: "Q3", online: 110, shop: 130 },
      { label: "Q4", online: 190, shop: 160 },
    ],
  },

  smallSlicesPieChart: {
    type: "Pie",
    data: [
      { label: "Rent", value: 900 },
      { label: "Food", value: 40 },
      { label: "Transport", value: 25 },
      { label: "Gifts", value: 15 },
      { label: "Books", value: 10 },
      { label: "Fun", value: 8 },
    ],
    width: 500,
    height: 400,
    hasTooltip: true,
  },

  halfPieChart: {
    type: "Donut",
    data: [
      { label: "Rent", value: 900 },
      { label: "Food", value: 380 },
      { label: "Transport", value: 160 },
      { label: "Fun", value: 120 },
    ],
    width: 500,
    height: 300,
    startAngle: -90,
    endAngle: 90,
    cy: "75%",
    outerRadius: "90%",
    hasTooltip: true,
    hasLegend: true,
  },

  categoryPieChart: {
    type: "Pie",
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
    hasTooltip: true,
  },

  categoryPieChartComposition: {
    type: "Pie",
    data: [
      { name: "Category A", value: 20 },
      { name: "Category B", value: 35 },
      { name: "Category C", value: 15 },
      { name: "Category D", value: 10 },
      { name: "Category E", value: 10 },
      { name: "Category F", value: 25 },
    ],
  },

  pieCustomPosition: {
    type: "Pie",
    data: [
      { label: "North", value: 30 },
      { label: "South", value: 25 },
      { label: "East", value: 20 },
      { label: "West", value: 25 },
    ],
    width: 500,
    height: 400,
    cx: "35%",
    cy: "35%",
    hasTooltip: true,
  },

  pieCustomPositionComposition: {
    type: "Pie",
    data: [
      { name: "North", value: 30 },
      { name: "South", value: 25 },
      { name: "East", value: 20 },
      { name: "West", value: 25 },
    ],
  },

  piePartial: {
    type: "Pie",
    data: [
      { label: "Q1", value: 25 },
      { label: "Q2", value: 30 },
      { label: "Q3", value: 20 },
      { label: "Q4", value: 25 },
    ],
    width: 500,
    height: 400,
    startAngle: 180,
    endAngle: 0,
    hasTooltip: true,
  },

  piePartialComposition: {
    type: "Pie",
    data: [
      { name: "Q1", value: 25 },
      { name: "Q2", value: 30 },
      { name: "Q3", value: 20 },
      { name: "Q4", value: 25 },
    ],
  },

  pieWithPadding: {
    type: "Pie",
    data: [
      { label: "Red", value: 30 },
      { label: "Blue", value: 25 },
      { label: "Green", value: 20 },
      { label: "Yellow", value: 25 },
    ],
    width: 500,
    height: 400,
    paddingAngle: 5,
    hasTooltip: true,
  },

  pieWithPaddingComposition: {
    type: "Pie",
    data: [
      { name: "Red", value: 30 },
      { name: "Blue", value: 25 },
      { name: "Green", value: 20 },
      { name: "Yellow", value: 25 },
    ],
  },

  pieMinAngle: {
    type: "Pie",
    data: [
      { label: "Large", value: 50 },
      { label: "Medium", value: 30 },
      { label: "Small", value: 5 },
      { label: "Tiny", value: 3 },
      { label: "Other", value: 12 },
    ],
    width: 500,
    height: 400,
    minAngle: 10,
    hasTooltip: true,
  },

  pieMinAngleComposition: {
    type: "Pie",
    data: [
      { name: "Large", value: 50 },
      { name: "Medium", value: 30 },
      { name: "Small", value: 5 },
      { name: "Tiny", value: 3 },
      { name: "Other", value: 12 },
    ],
  },

  pieRounded: {
    type: "Pie",
    data: [
      { label: "Option A", value: 30 },
      { label: "Option B", value: 25 },
      { label: "Option C", value: 20 },
      { label: "Option D", value: 25 },
    ],
    width: 500,
    height: 400,
    cornerRadius: 10,
    hasTooltip: true,
  },

  pieRoundedComposition: {
    type: "Pie",
    data: [
      { name: "Option A", value: 30 },
      { name: "Option B", value: 25 },
      { name: "Option C", value: 20 },
      { name: "Option D", value: 25 },
    ],
  },

  pieCustomData: {
    type: "Pie",
    data: [
      { product: "Laptop", sales: 150 },
      { product: "Phone", sales: 200 },
      { product: "Tablet", sales: 100 },
      { product: "Watch", sales: 80 },
    ],
    width: 500,
    height: 400,
    dataKey: (d) => d.sales,
    nameKey: (d) => d.product,
    hasTooltip: true,
  },

  pieCustomDataComposition: {
    type: "Pie",
    data: [
      { product: "Laptop", sales: 150 },
      { product: "Phone", sales: 200 },
      { product: "Tablet", sales: 100 },
      { product: "Watch", sales: 80 },
    ],
  },

  pieAdvanced: {
    type: "Pie",
    data: [
      { label: "Team A", value: 40 },
      { label: "Team B", value: 30 },
      { label: "Team C", value: 20 },
      { label: "Team D", value: 10 },
    ],
    width: 500,
    height: 400,
    paddingAngle: 3,
    cornerRadius: 8,
    minAngle: 5,
    hasTooltip: true,
  },

  pieAdvancedComposition: {
    type: "Pie",
    data: [
      { name: "Team A", value: 40 },
      { name: "Team B", value: 30 },
      { name: "Team C", value: 20 },
      { name: "Team D", value: 10 },
    ],
  },

  categoryDonutChart: {
    type: "Donut",
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
    hasTooltip: true,
  },

  categoryDonutChartComposition: {
    type: "Pie",
    data: [
      { name: "Desktop", value: 45 },
      { name: "Mobile", value: 30 },
      { name: "Tablet", value: 15 },
      { name: "Other", value: 10 },
    ],
  },

  productLineChart: {
    type: "Line",
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

  productAreaChart: {
    type: "Area",
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

  productBarChart: {
    type: "Bar",
    data: [
      { name: "A", uv: 400, pv: 240 },
      { name: "B", uv: 300, pv: 456 },
      { name: "C", uv: 300, pv: 139 },
      { name: "D", uv: 200, pv: 980 },
      { name: "E", uv: 278, pv: 390 },
      { name: "F", uv: 189, pv: 480 },
    ],
  },

  horizontalBarChart: {
    type: "Bar",
    orientation: "horizontal",
    data: [
      { label: "Customer support", votes: 42 },
      { label: "Faster checkout", votes: 35 },
      { label: "Dark mode", votes: 28 },
      { label: "Offline mode", votes: 17 },
    ],
    width: 800,
    height: 300,
    hasGrid: true,
    hasTooltip: true,
    xAxisLabel: "Votes",
  },

  horizontalBarChartComposition: {
    type: "Bar",
    data: [
      { label: "Customer support", online: 30, shop: 12 },
      { label: "Faster checkout", online: 20, shop: 15 },
      { label: "Dark mode", online: 18, shop: 10 },
    ],
  },

  scatterChart: {
    type: "Scatter",
    data: [
      {
        name: "Cars",
        points: [
          { x: 1100, y: 17 },
          { x: 1350, y: 15 },
          { x: 1500, y: 13 },
          { x: 1800, y: 11 },
        ],
      },
      {
        name: "Vans",
        points: [
          { x: 2100, y: 10 },
          { x: 2400, y: 9 },
          { x: 2900, y: 7 },
        ],
      },
    ],
    width: 800,
    height: 400,
    hasGrid: true,
    hasTooltip: true,
    hasLegend: true,
    xAxisLabel: "Weight (kg)",
    yAxisLabel: "km per litre",
  },

  scatterChartComposition: {
    type: "Scatter",
    data: [
      {
        name: "Cities",
        points: [
          { x: 10, y: 30, z: 200 },
          { x: 25, y: 45, z: 800 },
          { x: 40, y: 20, z: 400 },
          { x: 55, y: 60, z: 1200 },
        ],
      },
    ],
  },

  radarChart: {
    type: "Radar",
    data: [
      { label: "Speed", modelA: 8, modelB: 5 },
      { label: "Power", modelA: 5, modelB: 9 },
      { label: "Range", modelA: 7, modelB: 6 },
      { label: "Comfort", modelA: 6, modelB: 8 },
      { label: "Price", modelA: 9, modelB: 4 },
    ],
    width: 800,
    height: 400,
    hasTooltip: true,
    hasLegend: true,
  },

  radarChartComposition: {
    type: "Radar",
    data: [
      { label: "Speed", modelA: 8 },
      { label: "Power", modelA: 5 },
      { label: "Range", modelA: 7 },
      { label: "Comfort", modelA: 6 },
      { label: "Price", modelA: 9 },
    ],
  },

  radialChart: {
    type: "Radial",
    data: [
      { label: "Move", value: 84 },
      { label: "Exercise", value: 50 },
      { label: "Stand", value: 83 },
    ],
    width: 500,
    height: 400,
    hasTooltip: true,
  },

  radialChartComposition: {
    type: "Radial",
    data: [
      { label: "Move", value: 84 },
      { label: "Exercise", value: 50 },
      { label: "Stand", value: 83 },
    ],
  },
}
