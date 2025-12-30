export const entities = {
  // Line Chart
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

  // Line Chart with multiple series
  multiSeriesLineChart: {
    type: "line",
    data: [
      {
        name: "Product A",
        values: [
          { x: 0, y: 100 },
          { x: 1, y: 150 },
          { x: 2, y: 120 },
          { x: 3, y: 180 },
        ],
      },
      {
        name: "Product B",
        values: [
          { x: 0, y: 80 },
          { x: 1, y: 120 },
          { x: 2, y: 140 },
          { x: 3, y: 160 },
        ],
      },
      {
        name: "Product C",
        values: [
          { x: 0, y: 60 },
          { x: 1, y: 90 },
          { x: 2, y: 110 },
          { x: 3, y: 130 },
        ],
      },
      {
        name: "Product D",
        values: [
          { x: 0, y: 120 },
          { x: 1, y: 45 },
          { x: 2, y: 150 },
          { x: 3, y: 85 },
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
          { x: 0, y: 100 },
          { x: 0.5, y: 110 },
          { x: 1, y: 150 },
          { x: 1.5, y: 160 },
          { x: 2, y: 120 },
          { x: 3, y: 180 },
          { x: 4, y: 200 },
        ],
      },
      {
        name: "Expenses",
        values: [
          { x: 0, y: 80 },
          { x: 0.5, y: 100 },
          { x: 1, y: 120 },
          { x: 1.5, y: 130 },
          { x: 2, y: 140 },
          { x: 3, y: 160 },
          { x: 4, y: 150 },
        ],
      },
      {
        name: "Profit",
        values: [
          { x: 0, y: 20 },
          { x: 0.5, y: 10 },
          { x: 1, y: 30 },
          { x: 1.5, y: 20 },
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
}
